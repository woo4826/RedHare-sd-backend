# RedHare SD Backend

**Stable Diffusion 기반 사용자 맞춤형 프로필 생성 어플리케이션**의 API 게이트웨이 서버.
직접 학습/추론하지 않고, 아래 두 서버 사이에서 **인증 + 파일 업로드 + 요청 중계**만 담당한다.

| 대상 | 역할 |
| --- | --- |
| CMG 서버 (Customized Model Generator) | 업로드된 이미지/영상으로 LoRA 학습, 모델 목록 관리 |
| SD WebUI (AUTOMATIC1111 API) | `txt2img` 이미지 생성 |
| MySQL | 유저, 모델 메타데이터 |

## 실행

```bash
npm install
pm2 start index.js        # 운영 (백그라운드)
npm run dev               # 개발 (nodemon)
```


### 환경변수 (`.env`)

| 키 | 용도 |
| --- | --- |
| `PORT` | 리슨 포트 |
| `JWT_SECRET` | access/refresh 토큰 서명 키 |
| `DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` | MySQL 접속 정보 (`config/database.js`) |
| `DB_DEV_*`, `DB_PORT`, `SESSION_SECRET` | 현재 코드에서 사용 안 함 |

## API 명세

Base URL: `http://{host}:3000`


### 엔드포인트 목록

| Method | Path | Auth | 설명 |
| --- | --- | --- | --- |
| POST | [`/generate-lora`](#post-generate-lora) | O | 이미지로 LoRA 학습 요청 |
| POST | [`/generate-lora-video`](#post-generate-lora-video) | O | 영상으로 LoRA 학습 요청 |
| GET | [`/get-models`](#get-get-models) | O | 내 모델 목록 |
| POST | [`/update-nickname`](#post-update-nickname) | O | 모델 닉네임 변경 |
| POST | [`/create-image`](#post-create-image) | O | 이미지 생성 |
| GET | [`/image/:folder/:name`](#get-imagefoldername) | X | 업로드 이미지(썸네일) 조회 |
| POST | [`/sign-up`](#post-sign-up) | X | 회원가입 |
| POST | [`/login`](#post-login) | X | 로그인 |
| GET | [`/user/:id`](#get-userid) | O | 유저 조회 |




---

### `POST /generate-lora`

Request (`multipart/form-data`)

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `images` | file[] | O | 최대 20장 |

서버가 `uploads/{userId}_{independent_key}/`에 저장한 뒤 CMG `POST /model`로 전달한다. 첫 번째 파일이 썸네일이 된다.

Response

| 상태 | body |
| --- | --- |
| `200` | CMG 서버 응답 그대로 |
| `400` | `No user ID` (text) |
| `400` | `Error uploading files.` (text). 20장 초과, 필드명 불일치 포함 |
| `500` | `Error sending request` (text). CMG 서버 오류/미기동 |

---

### `POST /generate-lora-video`

Request (`multipart/form-data`)

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `video` | file | O | 여러 개 보내도 첫 파일만 사용 |

서버가 `videos/{userId}_{independent_key}/`에 저장한 뒤 CMG `POST /model/video`로 전달한다 (`interval=90` 고정).

Response: `/generate-lora`와 동일.

---

### `GET /get-models`

CMG `GET /model?user_id={토큰의 userId}` 프록시.

Response

| 상태 | body |
| --- | --- |
| `200` | CMG 서버 응답 그대로 |
| `500` | `Error sending request` (text) |

응답의 `thumbnail_image`(`uploads/{folder}/{name}`)는 [`/image/:folder/:name`](#get-imagefoldername)으로 조회한다.

---

### `POST /update-nickname`

Request (`application/json`)

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `independent_key` | string | O | 모델 키 (UUID) |
| `cm_nickname` | string | O | 새 닉네임 |

Response

| 상태 | body |
| --- | --- |
| `200` | 변경된 닉네임 (text) |
| `500` | `Error updating nickname` (text) |

키가 존재하지 않아도 `200`을 반환한다. 소유자 검사 없음.

---

### `POST /create-image`

Request (`application/json`)

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `prompt` | string | O | 서버의 고정 base prompt(증명사진 스타일) 뒤에 붙는다 |

Response

| 상태 | body |
| --- | --- |
| `200` | `data:image/png;base64,iVBORw0...` (text) |
| `200` | `no prompt` (text). `prompt` 누락 |
| `200` | `{ "err": "no res" }` |

SD WebUI 연결 실패 시 응답을 보내지 않는다 (타임아웃). 현재 유저 LoRA는 적용되지 않는다.

---

### `GET /image/:folder/:name`

| 파라미터 | 설명 |
| --- | --- |
| `folder` | `{userId}_{independent_key}` |
| `name` | 파일명 (`{timestamp}-{원본파일명}`) |

예: `GET /image/1_2e10cbdb-85ef-43b9-9ba7-c02482c8f75d/1716974651964-a.jpeg`

Response: `200` 이미지 파일, 없으면 `404`.

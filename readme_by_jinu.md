
1. **실행방법**

yarn docker:dev 
yarn docker:prod

둘중 하나 실행하면.
1. yarn docker:prod -> package.json 의 해당 명령어를 찾음 "docker-compose -f docker-compose.yml -f docker-compose.prod.yml up"
1.1. 이는 docker-compose.yml 을 실행하고(워크스페이스 초기화 및 기본 디펜던시 가져옴 by Dockerfile) 
 (docker 로 mongodb실행 with .env.mongodb 의 설정값을 기준으로 실행)

 -> docker-compose.prod.yml 을 실행

 -> yarn start -> package.json의 start로 다시 가서 실행

 -> 프로젝트 실행됨 (pm2 start ecosystem.config.json --no-daemon) pm2를 통해 호스팅 (서버켜짐) 

2. yarn docker:dev -> package.json 의 해당 명령어를 찾음 "docker-compose -f docker-compose.yml -f docker-compose.dev.yml up"
1.1. 이는 docker-compose.yml 을 실행하고(워크스페이스 초기화 및 기본 디펜던시 가져옴 by Dockerfile) 
 (docker 로 mongodb실행 with .env.mongodb 의 설정값을 기준으로 실행)

 -> docker-compose.dev.yml 을 실행

 -> yarn start -> package.json의 dev 다시 가서 실행

 -> 개발 모드로 실행됨 (cross-env NODE_ENV=development nodemon src/index.js) nodemon 을 통해 코드 변경사항 발생 시 실시간 재빌드 및 재배포  -> 중단없이 테스팅 가능


두가지 방법을 통해 실행함..

일단 현재 개발되어있는것들 -> 다른사람이 한거 떄온거임

**Auth routes**:\
`POST /auth/register` - register\
`POST /auth/login` - login\
`POST /auth/refresh-tokens` - refresh auth tokens\
`POST /auth/forgot-password` - send reset password email\
`POST /auth/reset-password` - reset password\
`POST /auth/send-verification-email` - send verification email\
`POST /auth/verify-email` - verify email

**User routes**:\
`POST /users` - create a user\
`GET /users` - get all users\
`GET /users/:userId` - get user\
`PATCH /users/:userId` - update user\
`DELETE /users/:userId` - delete user


**개발해야 할 것**
**Lora routes**:\
`POST /lora/uploadFile` - 파일을 업로드하여 로라 생성
`GET /lora/getLoras` - 현재 해당 사용자가 가지고있느 모델 리턴

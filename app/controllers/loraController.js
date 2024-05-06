const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const auth = require('../middlewares/isAuth');
const express=require('express');
const FormData=require('form-data')
const axios=require('axios')
const app = express();
 


const payload = {
    prompt: "",
    negative_prompt:
      "bad anatomy, bad proportions, blurry, cloned face, deformed, disfigured, duplicate, extra arms, extra fingers, extra limbs, extra legs, fused fingers, gross proportions, long neck, malformed limbs, missing arms, missing legs, mutated hands, mutation, mutilated, morbid, out of frame, poorly drawn hands, poorly drawn face, too many fingers, ugly, ugly, duplicate, morbid, mutilated, out of frame, extra fingers, mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed, ugly, blurry, bad anatomy, bad proportions, extra limbs, cloned face, disfigured, out of frame, ugly, extra limbs, bad anatomy, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, mutated hands, fused fingers, too many fingers, long neck, (worst quality, normal quality, low quality:1.5) , ((nsfw))",
    steps: 20,
    sampler_name: "DPM++ 2M Karras",
    "cfg-scale": 7,
    seed: "-1",
    alwayson_scripts: {
      ADetailer: {
        args: [
          true,
          false,
          {
            ad_model: "face_yolov8n.pt",
            ad_prompt: "",
            ad_negative_prompt: "",
            ad_confidence: 0.3,
            ad_mask_k_largest: 0,
            ad_mask_min_ratio: 0.0,
            ad_mask_max_ratio: 1.0,
            ad_dilate_erode: 32,
            ad_x_offset: 0,
            ad_y_offset: 0,
            ad_mask_merge_invert: "None",
            ad_mask_blur: 4,
            ad_denoising_strength: 0.4,
            ad_inpaint_only_masked: true,
            ad_inpaint_only_masked_padding: 0,
            ad_use_inpaint_width_height: false,
            ad_inpaint_width: 512,
            ad_inpaint_height: 512,
            ad_use_steps: true,
            ad_steps: 28,
            ad_use_cfg_scale: false,
            ad_cfg_scale: 7.0,
            ad_use_sampler: false,
            ad_sampler: "DPM++ 2M Karras",
            ad_use_noise_multiplier: false,
            ad_noise_multiplier: 1.0,
            ad_use_clip_skip: false,
            ad_clip_skip: 1,
            ad_restore_face: false,
            ad_controlnet_model: "None",
            ad_controlnet_module: "None",
            ad_controlnet_weight: 1.0,
            ad_controlnet_guidance_start: 0.0,
            ad_controlnet_guidance_end: 1.0,
          },
        ],
      },
    },
  };


const uploadDirectory = 'uploads/';

function getUserIdFromToken(token) {
  // 여기서는 단순히 토큰의 두 번째 부분을 사용자 아이디로 가정합니다.
  return token.split(' ')[1];
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 사용자의 아이디 값을 가져옵니다. 여기서는 토큰에서 아이디 값을 추출한다고 가정합니다.
    let userId = getUserIdFromToken(req.headers.authorization);

    // 사용자 아이디에 해당하는 폴더 경로를 생성합니다.
    let userUploadDirectory = path.join(uploadDirectory, userId);

    // 해당 경로가 존재하지 않으면 폴더를 생성합니다.
    if (!fs.existsSync(userUploadDirectory)) {
      fs.mkdirSync(userUploadDirectory, { recursive: true });
    }

    // 파일이 저장될 최종 경로를 설정합니다.
    cb(null, userUploadDirectory);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// 파일 필터링 함수 설정 (이미지 파일만 허용)


// 업로드 인스턴스 생성
exports.upload = (req, res, next) => {
  let token = req.headers.authorization.split(' ')[1];
  
  try {
      let payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      console.log('토큰 인증 성공', payload);
      // 토큰 인증 성공한 경우 파일 업로드를 처리합니다.
      upload.array('images', 5)(req, res, err => {
          if (err) {
              console.log(err);
              res.status(400).send("Error uploading files.");
          } else {
              // 파일 정보를 반환합니다.
              console.log(req.body);
              console.log(payload);
              res.send(req.file);
          }
      });
      

  } catch (err) {
      console.log("인증 에러");
      res.status(405).json({ msg: 'error' });
      next();
  }
};








// // 파일을 읽어와서 요청을 보내는 작업 수행
// exports.generateLora = (req,res,next) => {
//   // 사용자 ID를 FormData에 추가 (토큰 값 사용)
//   let token = req.headers.authorization.split(' ')[1];
//   let payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
//   console.log('토큰 인증 성공', payload);
//   let directory = path.join('uploads', token);
  
//   // fs.readdir(directory, (err, files) => {
//   //   if (err) {
//   //     console.error('Error reading directory:', err);
//   //     return callback(err);
//   //   }
//   //   callback(null, files);
//   // });

//   const url = 'http://203.252.161.106:4000/generateModel';

//   // FormData 객체 생성
//   const formData = new FormData();
//   formData.append('id', payload.id);
//   // 파일 정보를 FormData에 추가

//   files.forEach(file => {
//     formData.append('files', fs.createReadStream(path.join(uploadDirectory, file)));
//   });

  

//   // POST 요청 보내기
  
//   res=axios.post(url, formData, {
//     headers: {
//       ...formData.getHeaders(),
//       // 다른 헤더들도 필요하면 여기에 추가
//     }
//   })
//   .then(response => {
//     console.log('Response:', response.data);
//   })
//   .catch(error => {
//     console.error('Error:', error);
//   });
  

// }





exports.generateLora = (req, res, next) => {
  // 사용자 ID를 FormData에 추가 (토큰 값 사용)
  let token = req.headers.authorization.split(' ')[1];
  let payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  console.log('토큰 인증 성공', payload);
  let directory = path.join('uploads', token);
  
  fs.readdir(directory, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return res.status(500).send('Error reading directory');
    }

    const url = 'http://203.252.161.106:4000/generateModel';

    // FormData 객체 생성
    const formData = new FormData();
    formData.append('id', payload.id);
    
    // 파일 정보를 FormData에 추가
    files.forEach(file => {
      formData.append('files', fs.createReadStream(path.join(directory, file)));
    });

    // POST 요청 보내기
    axios.post(url, formData, {
      headers: {
        ...formData.getHeaders(),
        // 다른 헤더들도 필요하면 여기에 추가
      }
    })
    .then(response => {
      console.log('Response:', response.data);
      res.status(200).send(response.data);
    })
    .catch(error => {
      console.error('Error:', error);
      res.status(500).send('Error sending request');
    });
  });
};



  





exports.make = async (req, res, next) => {
	var item = req.body;
    var numFiles = 0;
    var result = [];
    var randSeed =
      Math.floor(Math.random() * (9999999999 - 1000000000 + 1)) + 1000000000;
  if (item.prompt == undefined || item.prompt == null){
    res.send("no prompt");
    return;
  }
    for (const i of Array.from(item.prompt)) {
      let targetPayload;
      if (i.includes("...up...scaling...")) {
        targetPayload = payloadUpscale;
      } else {
        targetPayload = payload;
      }
  
      if (i.includes("girl")) {
        targetPayload.prompt = prompt_girl + i;
      } else {
        targetPayload.prompt = prompt_boy + i;
      }
  
      targetPayload.seed = randSeed;
      console.log("==========================================");
      console.log(JSON.stringify(targetPayload));
      console.log("==========================================");
  
      const asdf = await callFunction(targetPayload, numFiles);
      if (!asdf) {
        return res.json({ err: "no res" });
      }
  
      result.push('data:image/png;base64,'+asdf);
      numFiles = numFiles + 1;
    }
    res.json({ images: result });
};


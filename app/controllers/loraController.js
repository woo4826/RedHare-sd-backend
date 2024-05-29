const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const fetch = require("node-fetch");

const express = require("express");
const FormData = require("form-data");

const axios = require("axios");

const CModel = require("../models/CustomizedModel");
const { Model, UUID } = require("sequelize");
const { isMimeType } = require("validator");

const uploadDirectory = "uploads/";

const CMG_URL = "http://203.252.161.106:4000";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 사용자의 아이디 값을 가져옵니다. 여기서는 토큰에서 아이디 값을 추출한다고 가정합니다.
    let imagePath = req.imagePath;

    // 사용자 아이디에 해당하는 폴더 경로를 생성합니다.
    let userUploadDirectory = path.join( imagePath);

    // 해당 경로가 존재하지 않으면 폴더를 생성합니다.
    if (!fs.existsSync(userUploadDirectory)) {
      fs.mkdirSync(userUploadDirectory, { recursive: true });
    }

    // 파일이 저장될 최종 경로를 설정합니다.
    cb(null, userUploadDirectory);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const multerFile = multer({ storage });

exports.uploadImage = (req, res, next) => {
  let token = req.headers.authorization.split(" ")[1];

  try {
    multerFile.array("files")(req, res, (err) => {
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
    res.status(405).json({ msg: "error" });
    next();
  }
};

exports.generateLora = (req, res, next) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(400).send("No user ID");
  }
  //path like this uploads/4
  //if path  does not exist, create it
  var ikey = uuidv4();
  let imagePath = `${uploadDirectory}${userId}_${ikey}`;
  req.imagePath = imagePath;
  let payload = {};
  if (!fs.existsSync(imagePath)) {
    fs.mkdirSync(imagePath, { recursive: true });
  }
  if (fs.existsSync(imagePath)) {
    fs.readdir(imagePath, (err, files) => {
      if (err) {
        console.error("Error reading directory:", err);
        return res.status(500).send("Error reading directory");
      }
      for (const file of files) {
        fs.unlinkSync(path.join(imagePath, file));
      }
    });
  }
  multerFile.array("images", 20)(req, res, (err) => {
    if (err) {
      console.log(err);
      res.status(400).send("Error uploading files.");
    } else {
      fs.readdir(imagePath, (err, files) => {
        if (err) {
          console.error("Error reading directory:", err);
          return res.status(500).send("Error reading directory");
        }

        
        const formData = new FormData();

        // files.forEach((file) => {
        //   formData.append(
        //     "files",
        //     //여기잘 보셈

        //     file
        //     // fs.createReadStream(imagePath)
        //   );
        // });
        console.log(files.length);
        //formData.append('files',files[0]);
        console.log(files);
        for (var f in files) {
          formData.append(
            "files",
            fs.createReadStream(path.join(imagePath, files[f]))
          );
        }
        // for (let i = 0; i < files.length; i++) {
        //   formData.append("files", files[i]);
        // }
        formData.append("user_id", userId);

        formData.append("independent_key", ikey);
        // console.log(formData.getAll("files"));
        var filename;
        fs.readdir(imagePath,  function(error, filelist){
          filename=filelist[0];
          formData.append("thumbnail_image",imagePath.toString()+"/"+filename);
          //console.log(filelist[0]);
          console.log("dfdf");
        console.log(imagePath.toString()+filename);
        console.log("afaf");
        axios
          .post(CMG_URL + "/model", formData)
          .then((response) => {
            console.log("Response:", response.data);
            res.status(200).send(response.data);
          })
          .catch((error) => {
            console.error("Error:", error);
            res.status(500).send("Error sending request");
          });
        })
        
        
        
        // const model = await CModel.create({
        //   user_id: req.userId,
        //   independent_key : ikey
        // });
      });

      // for (const [key, value] of formData.entries()) {
      //   console.log(key, value);
      // }
    }
  });
};

exports.getModels = async (req, res, next) => {
  const userId = req.userId;
  axios
    .get(CMG_URL + "/model" + "?user_id=" + userId)
    .then((response) => {
      console.log("Response:", response.data);
      res.status(200).send(response.data);
    })
    .catch((error) => {
      console.error("Error:", error);
      res.status(500).send("Error sending request");
    });
};

exports.createImage = async (req, res, next) => {
  var item = req.body;
  var numFiles = 0;
  var result = [];
  var randSeed =
    Math.floor(Math.random() * (9999999999 - 1000000000 + 1)) + 1000000000;
  if (item.prompt == undefined || item.prompt == null) {
    res.send("no prompt");
    return;
  }

  let targetPayload;

  targetPayload = payload;
  if (item.modelName.includes("1_edc90329")) {
    targetPayload.prompt = base_prompt + item.prompt + "<lora:iu_v35:1>";
  } else {
    targetPayload.prompt = base_prompt + item.prompt + "<lora:aespakarina-v5:1>";
  }
  // targetPayload.prompt = base_prompt + i + "<lora:"+ req.modelName + ":0.8>";

  targetPayload.seed = randSeed;
  console.log("==========================================");
  console.log(JSON.stringify(targetPayload));
  console.log("==========================================");

  const asdf = await callFunction(targetPayload, numFiles);
  if (!asdf) {
    return res.json({ err: "no res" });
  }

  result.push("data:image/png;base64," + asdf);

  res.send(result[0]);
};

const base_prompt =
  "(id photo:1.2), (upper body:1.2), (masterpiece,best quality,ultra_detailed,highres,absurdres:1.2),extremely detailed CG unity 8k wallpaper <lora:add_detail:1>";

const payload = {
  prompt: "",
  negative_prompt:
    "bad anatomy, bad proportions, blurry, cloned face, deformed, disfigured, duplicate, extra arms, extra fingers, extra limbs, extra legs, fused fingers, gross proportions, long neck, malformed limbs, missing arms, missing legs, mutated hands, mutation, mutilated, morbid, out of frame, poorly drawn hands, poorly drawn face, too many fingers, ugly, ugly, duplicate, morbid, mutilated, out of frame, extra fingers, mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed, ugly, blurry, bad anatomy, bad proportions, extra limbs, cloned face, disfigured, out of frame, ugly, extra limbs, bad anatomy, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, mutated hands, fused fingers, too many fingers, long neck, (worst quality, normal quality, low quality:1.5) , ((nsfw))",
  steps: 20,
  sampler_name: "DPM++ SDE Karras",
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

// function base64ToPNG(data) {
//   data = data.replace(/^data:image\/png;base64,/, '');

//   fs.writeFile(path.resolve(__dirname, 'public/images/image.png'), data, 'base64', function(err) {
//     if (err) throw err;
//   });
// }
callFunction = async (payload, num) => {
  const url = "http://203.252.161.106:7860";

  const optionPayload = {
    sd_model_checkpoint: "magic.safetensors [7c819b6d13]",
  };

  const optionResponse = await fetch(`${url}/sdapi/v1/options`, {
    method: "POST",
    body: JSON.stringify(optionPayload),
    headers: { "Content-Type": "application/json" },
  });

  try {
    const response = await fetch(`${url}/sdapi/v1/txt2img`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const responseData = await response.json();

    const rawImage = responseData["images"][0].split(",", 1)[0];

    //base64ToPNG(rawImage);

    const pngPayload = {
      image: "data:image/png;base64," + rawImage,
    };

    const response2 = await fetch(`${url}/sdapi/v1/png-info`, {
      method: "POST",
      body: JSON.stringify(pngPayload),
      headers: { "Content-Type": "application/json" },
    });
    const pngInfo = await response2.json();

    console.log("image success");

    return rawImage;
  } catch (error) {
    console.error("Connection error occurred");
    throw error;
  }
};

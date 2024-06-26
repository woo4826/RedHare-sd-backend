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
const CMProcessing = require("../models/CMProcessing");
const { Model, UUID } = require("sequelize");
const { isMimeType } = require("validator");
const User = require("../models/User");

const uploadDirectory = "uploads/";
const videoUploadDirectory = "videos/";

const CMG_URL = "http://localhost:4000";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 사용자의 아이디 값을 가져옵니다. 여기서는 토큰에서 아이디 값을 추출한다고 가정합니다.
    let imagePath = req.imagePath;

    // 사용자 아이디에 해당하는 폴더 경로를 생성합니다.
    let userUploadDirectory = path.join(imagePath);

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
        for (var f in files) {
          formData.append(
            "files",
            fs.createReadStream(path.join(imagePath, files[f]))
          );
        }
        formData.append("user_id", userId);
        formData.append("independent_key", ikey);
        var filename;
        fs.readdir(imagePath, function (error, filelist) {
          filename = filelist[0];
          formData.append(
            "thumbnail_image",
            imagePath.toString() + "/" + filename
          );
          formData.append("file_number", files.length);
          console.log(imagePath.toString() + filename);
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
        });
      });
    }
  });
};

exports.generateLoraVideo = (req, res, next) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(400).send("No user ID");
  }
  //path like this uploads/4
  //if path  does not exist, create it
  var ikey = uuidv4();
  let videoPath = `${videoUploadDirectory}${userId}_${ikey}`;
  req.imagePath = videoPath;
  if (!fs.existsSync(videoPath)) {
    fs.mkdirSync(videoPath, { recursive: true });
  }
  if (fs.existsSync(videoPath)) {
    fs.readdir(videoPath, (err, files) => {
      if (err) {
        console.error("Error reading directory:", err);
        return res.status(500).send("Error reading directory");
      }
      for (const file of files) {
        fs.unlinkSync(path.join(videoPath, file));
      }
    });
  }
  multerFile.array("video")(req, res, (err) => {
    if (err) {
      console.log(err);
      res.status(400).send("Error uploading files.");
    } else {
      fs.readdir(videoPath, (err, files) => {
        if (err) {
          console.error("Error reading directory:", err);
          return res.status(500).send("Error reading directory");
        }
        const formData = new FormData();

        formData.append("user_id", userId);
        formData.append("independent_key", ikey);
        formData.append("interval", "90");
        formData.append('video',fs.createReadStream(path.join(videoPath, files[0])) );
        var filename;
        fs.readdir(videoPath, function (error, filelist) {
          filename = filelist[0];

          axios
            .post(CMG_URL + "/model/video", formData)
            .then((response) => {
              console.log("Response:", response.data);
              return res.status(200).send(response.data);
            })
            .catch((error) => {
              console.error("Error:", error);
              return res.status(500).send("Error sending request");
            });
        });
      });
    }
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

  targetPayload.prompt = base_prompt + item.prompt;
  targetPayload.alwayson_scripts.ADetailer.args.ad_prompt =
    "<lora:" + req.modelName + ":0.8>";

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
// /home/user/RedHare-sd-backend/uploads/1_2e10cbdb-85ef-43b9-9ba7-c02482c8f75d/1716974651964-아이유5.jpeg
exports.getImage = (req, res, next) => {
  var imgPath = req.params.folder;
  var imgName = req.params.name;
  var fullPath = path.join("uploads/" + imgPath + "/" + imgName);
  console.log("이미지 요청: " + fullPath);
  res.sendFile(fullPath, { root: __dirname + "/../../" });
};
exports.getModels = async (req, res, next) => {
  var userId = req.userId;
  axios
    .get(CMG_URL + "/model" + "?user_id=" + userId)
    .then((response) => {
      console.log("Response:", response.data);
      return res.status(200).send(response.data);
    })
    .catch((error) => {
      console.error("Error:", error);
      return res.status(500).send("Error sending request");
    });
};

exports.update_nickname = async (req, res) => {
  try {
    // 로그 추가
    console.log("Requested nickname:", req.body.cm_nickname);
    console.log("Independent Key:", req.body.independent_key);

    // 업데이트
    const result1 = await CModel.update(
      { cm_nickname: req.body.cm_nickname }, // 업데이트할 칼럼 정보
      { where: { independent_key: req.body.independent_key } } // where 절
    );
    const result2 = await CMProcessing.update(
      { cm_nickname: req.body.cm_nickname }, // 업데이트할 칼럼 정보
      { where: { independent_key: req.body.independent_key } } // where 절
    );

    res.send(req.body.cm_nickname);
  } catch (error) {
    console.error("Error updating nickname:", error);
    res.status(500).send("Error updating nickname");
  }
};

const base_prompt =
  "(id photo:1.2), (upper body:1.2), (masterpiece,best quality,ultra_detailed,highres,absurdres:1.2),extremely detailed CG unity 8k wallpaper <lora:add_detail:1>,";

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
  const url = "http://redhare.ddns.net:6786";

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

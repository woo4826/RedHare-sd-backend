const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const express = require("express");
const FormData = require("form-data");
const axios = require("axios");

const uploadDirectory = "uploads/";

const CMG_URL = "http://203.252.161.106:4000";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 사용자의 아이디 값을 가져옵니다. 여기서는 토큰에서 아이디 값을 추출한다고 가정합니다.
    let userId = req.userId;

    // 사용자 아이디에 해당하는 폴더 경로를 생성합니다.
    let userUploadDirectory = path.join(uploadDirectory, userId.toString());

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
    multerFile.array("images")(req, res, (err) => {

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
  let userId = req.userId;
  if (!userId) {
    return res.status(400).send("No user ID");
  }
  //path like this uploads/4
  //if path  does not exist, create it

  let imagePath = `${uploadDirectory}${userId}`;
  let payload = {};
  if (!fs.existsSync(imagePath)) {
    fs.mkdirSync(imagePath, { recursive: true });
  }
  if( fs.existsSync(imagePath)){
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
      console.log(req.body);
      console.log(payload);

      fs.readdir(imagePath, (err, files) => {
        if (err) {
          console.error("Error reading directory:", err);
          return res.status(500).send("Error reading directory");
        }
        var formData = new FormData();
        formData.append("id", userId);
        files.forEach((file) => {
          formData.append(
            "files",
            fs.createReadStream(path.join(imagePath, file))
          );
        });
        axios
          .post(CMG_URL + "/generate", formData, {
            headers: {
              ...formData.getHeaders(),
            },
          })
          .then((response) => {
            console.log("Response:", response.data);
            res.status(200).send(response.data);
          })
          .catch((error) => {
            console.error("Error:", error);
            res.status(500).send("Error sending request");
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

    result.push("data:image/png;base64," + asdf);
    numFiles = numFiles + 1;
  }
  res.json({ images: result });
};

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

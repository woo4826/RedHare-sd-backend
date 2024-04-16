const express = require("express");
const app = express();
const ejs = require("ejs");
const axios = require("axios");
const fs = require("fs");
const { promisify } = require("util");
const { createCanvas, loadImage } = require("canvas");

const fetch = require("node-fetch");
const { Readable } = require("stream");
const streamifier = require("streamifier");

const bodyParser = require("body-parser");
app.set("view engine", "ejs");

app.use(bodyParser.json());

const multer = require("multer"); // multer middleware for handling file uploads
const path = require("path");
const { response } = require("express");

const port = 3000;

// Exception handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Internal Server Error");
});

// CORS middleware
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext); // Set unique filename with timestamp
  },
});

const upload = multer({ storage: storage });

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

class Item {
  constructor() {
    this.prompt = [];
  }
}

prompt_boy =
  " (id photo:1.2),one boy, short hair,  (upper body:1.2), detailed skin, distinct image, detail face, 8k, uhd, intricate quality, intricate details, Realistic, photorealistic, photograph, ultra high res, high resolution, masterpiece, best quality, 1boy, solo, black eyes, sharp nose, looking at viewer, cinemamic lighting, (school uniform:1.4) ,";
prompt_girl =
  "  (id photo:1.2), (upper body:1.2), detailed skin, distinct image, detail face, 8k, uhd, intricate quality, intricate details, Realistic, photorealistic, photograph, ultra high res, high resolution, masterpiece, best quality, 1girl, solo, black eyes, sharp nose, looking at viewer, cinemamic lighting, (school uniform:1.4),";

const writeFileAsync = promisify(fs.writeFile);

// Serve HTML file with the form
app.get("/", (req, res) => {
  res.render("index.ejs");
});

// Handle file upload
app.post("/upload", upload.single("fileInput"), (req, res) => {
  res.send("File uploaded successfully!");
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function base64ToPNG(data) {
  data = data.replace(/^data:image\/png;base64,/, '');

  fs.writeFile(path.resolve(__dirname, '../uccg/image.png'), data, 'base64', function(err) {
    if (err) throw err;
  });
}

const callFunction = async (payload, num) => {
  const url = "http://203.252.161.105:7860";

  const optionPayload = {
    sd_model_checkpoint: "majicmixRealistic_v7.safetensors [7c819b6d13]",
  };
  console.log("12233333");

  // app.post(`${url}/sdapi/v1/options`, (req, res)=>{
  //   req.body= JSON.stringify(optionPayload);
  //   req.headers = { 'Content-Type': 'application/json' };
  // });

  console.log("12233333");
  const optionResponse = await fetch(`${url}/sdapi/v1/options`, {
    method: "POST",
    body: JSON.stringify(optionPayload),
    headers: { "Content-Type": "application/json" },
  });

  console.log("12233333");
  try {
    const response = await fetch(`${url}/sdapi/v1/txt2img`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });
    // app.post(`${url}/sdapi/v1/txt2img`, (req, res)=>{
    //   req.body= JSON.stringify(payload);
    //   req.headers = { 'Content-Type': 'application/json' };

    // });
    //console.log(response)

    const responseData = await response.json();

    const rawImage = responseData["images"][0].split(",", 1)[0];
    //const image = await loadImage(rawImage);

    base64ToPNG(rawImage);


    const pngPayload = {
      image: 'data:image/png;base64,'+ rawImage
    };

    const response2 = await fetch(`${url}/sdapi/v1/png-info`, {
      method: "POST",
      body: JSON.stringify(pngPayload),
      headers: { "Content-Type": "application/json" },
    });
    const pngInfo = await response2.json();

    //const canvas = createCanvas(image.width, image.height);
    //const ctx = canvas.getContext('2d');
    //ctx.drawImage(image, 0, 0);

    // const out = fs.createWriteStream(`output${num}.png`);
    // const stream = canvas.createPNGStream();
    // stream.pipe(out);
    console.log("image success");

    return rawImage;
  } catch (error) {
    console.error("Connection error occurred");
    throw error;
  }
};

app.get("/exception", (req, res, next) => {
  throw new Error("Some exception");
});

app.post("/make", async (req, res) => {
  var item = req.body;
  var numFiles = 0;
  var result = [];
  var randSeed =
    Math.floor(Math.random() * (9999999999 - 1000000000 + 1)) + 1000000000;

  for (const i of item.prompt) {
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
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

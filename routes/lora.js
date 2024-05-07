const express = require('express');
const router = express.Router();
const loraController = require('../app/controllers/loraController');
const auth = require('../app/middlewares/jwt.js');

// router.post("/upload-image",auth.checkToken, loraController.upload);
router.post("/crate-image",auth.checkToken, loraController.createImage);
router.post("/generate-lora",auth.checkToken, loraController.generateLora);

module.exports=router;
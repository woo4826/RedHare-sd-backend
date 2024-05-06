const express = require('express');
const router = express.Router();
const loraController = require('../app/controllers/loraController');


router.post("/upload",loraController.upload);
router.post("/make",loraController.make);
router.post("/generateLora",loraController.generateLora);

module.exports=router;
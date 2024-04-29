// routes/upload.js

const express = require("express");
// const auth = require('../middlewares/auth');
const loraController = require("../controllers/lora.controller");

const router = express.Router();
const multer = require("multer");

router
  .post("/upload", loraController.uploadFile)
  .get("/", loraController.getLoras);
// Multer 설정



// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/"); // 업로드된 파일 저장 경로 설정
//   },
//   filename: function (req, file, cb) {
//     const ext = path.extname(file.originalname);
//     cb(null, Date.now() + ext); // 타임스탬프를 이용한 고유한 파일명 생성
//   },
// });
// const upload = multer({ storage: storage });


module.exports = router;

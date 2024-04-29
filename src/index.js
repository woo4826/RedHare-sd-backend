const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const route = require('./routes/index.js');

const app = express();

// app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// CORS 미들웨어
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// 라우트 등록
app.use('/', route);

// 예외 처리 미들웨어
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Internal Server Error");
});

module.exports = app;

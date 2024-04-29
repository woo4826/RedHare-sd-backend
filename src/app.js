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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

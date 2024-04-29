const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const {
  authService,
  userService,
  tokenService,
  emailService,
} = require("../services");

const uploadFile = catchAsync(async (req, res) =>
  res.send({ success: "asdf" })
);
const getLoras = catchAsync(async (req, res) =>
  res.send({ success: "asasdfasdfdf" })
);

module.exports = {
  uploadFile,
  getLoras,
};

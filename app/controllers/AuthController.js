const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const User = require("../models/User");
const jwt = require("../middlewares/jwt");

//
// router.post('/sign-up', AuthController.signUp);
// router.post('/login', AuthController.login);
// router.post('/logout', AuthController.logout);
// router.get('/refresh-token', AuthController.tokenRefresh);

exports.signUp = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      message: "Please provide an email and password",
    });
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({
      message: "Please provide a valid email",
    });
  }
  if (password.length < 6) {
    return res.status(400).json({
      message: "Password must be at least 6 characters",
    });
  }

  //check email duplicated
  const userExists = await User.findOne({ where: { email: email } });
  if (userExists) {
    return res.status(400).json({
      message: "User with that email already exists",
    });
  }
  try {
    const user = await User.create({
      email,
      password: bcrypt.hashSync(password, 10),
    });
    return res.status(201).json({
      message: "User created successfully",
      uid: user._id,
      email: user.email,
      joined: user.created_At,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      message: "Please provide an email and password",
    });
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({
      message: "Please provide a valid email",
    });
  }
  try {
    const user = await User.findOne({ where: { email: email } });
    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }
    return res.status(200).json({
      message: "Login successful",
      accessToken: jwt.generateToken(user),
      refreshToken: jwt.generateRefreshToken(),
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

// exports.logout = async (req, res) => {
// 	  const token = req.headers.authorization.split(' ')[1];
//   try {

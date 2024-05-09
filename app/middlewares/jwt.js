const jwt = require("jsonwebtoken");

checkToken = (req, res, next) => {
  var token = req.headers["authorization"]; // Express headers are auto converted to lowercase
  
  if (token) {
    jwt.verify(
      token,
      process.env.JWT_SECRET,

      (err, decoded) => {
        console.log(decoded);
        if (err) {
          return res.json({
            message: "Token is not valid",
            err: err,
          });
        } else {
          req.userId= decoded.id;
          next();
        }
      }
    );
  } else {
    return res.json({
      message: "Auth token is not supplied",
    });
  }
};

//generate token, re-issue token by using refresh token

generateToken = (user) => {
  console.log(process.env.JWT_SECRET);
  console.log(user._id);

  const token = jwt.sign(
    {
      email: user.email,
      id: user.id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "24h",
    }
  );
  return token;
};
generateRefreshToken = () => {
  const refreshToken = jwt.sign({}, process.env.JWT_SECRET, {
    expiresIn: "14d",
  });
  return refreshToken;
};

module.exports = {
  checkToken: checkToken,
  generateToken: generateToken,
  generateRefreshToken: generateRefreshToken,
};

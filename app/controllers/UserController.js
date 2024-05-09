const User = require('../models/User');

//
// router.get("/user/:id", auth.checkToken, UserController.getUserById);
// router.get("/users", auth.checkToken, UserController.getAllUsers);
// router.put("/user/:id", auth.checkToken, UserController.updateUser);
// router.delete("/user/:id", auth.checkToken, UserController.deleteUser);
// //home router
exports.getUserById = async (req, res) => {
  console.log("여기노?");
  console.log(req.params);
  let user = await User.findOne({where : { id: req.params.id }})
  
  
  
 
    console.log("여기노?");
    
    if (user) {
      console.log("여기노?");
      console.log("logged in");
      return res.status(200).json({
        message: "user found",
        id: user.id,
        email: user.email,
        
      });
    }
  
};


exports.getAllUsers = async (req, res) => {
  User.find({}, function (err, users) {
    if (err) {
      console.log(err);
      return res.status(401).json({
        message: "No users found.",
      });
    }
    if (users) {
      console.log("logged in");
      return res.status(200).json({
        message: "users found",
        users: users,
      });
    }
  }).catch((err) => {
    console.log(err);
    res.status(500).json({
      error: err,
    });
  });
}

exports.updateUser = async (req, res) => {
  User.findOneAndUpdate({ _id: req.params.id }, { email: req.body.email }, function (err, user) {
    if (err) {
      console.log(err);
      return res.status(401).json({
        message: "User does not exist.",
      });
    }
    if (user) {
      console.log("logged in");
      return res.status(200).json({
        message: "user updated",
        id: user._id,
        email: user.email,
        joined: user.created_At,
      });
    }
  }).catch((err) => {
    console.log(err);
    res.status(500).json({
      error: err,
    });
  });
}

exports.deleteUser = async (req, res) => {
  User.findOneAndDelete({ _id: req.params.id }, function (err, user) {
    if (err) {
      console.log(err);
      return res.status(401).json({
        message: "User does not exist.",
      });
    }
    if (user) {
      console.log("logged in");
      return res.status(200).json({
        message: "user deleted",
        id: user._id,
        email: user.email,
        joined: user.created_At,
      });
    }
  }).catch((err) => {
    console.log(err);
    res.status(500).json({
      error: err,
    });
  });
}
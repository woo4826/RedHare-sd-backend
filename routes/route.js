const express = require('express');
const router = express.Router();

const AuthController = require('../app/controllers/AuthController');
const UserController = require('../app/controllers/UserController');
const auth = require('../app/middlewares/jwt.js');

//auth router
router.post('/sign-up', AuthController.signUp);
router.post('/login', AuthController.login);
// router.post('/logout', AuthController.logout);
// router.get('/refresh-token', AuthController.tokenRefresh);
//user router
router.get("/user/:id", auth.checkToken, UserController.getUserById);
router.get("/users", auth.checkToken, UserController.getAllUsers);
router.put("/user/:id", auth.checkToken, UserController.updateUser);
router.delete("/user/:id", auth.checkToken, UserController.deleteUser);
//home router

module.exports = router;
const express = require("express");
const authRoute = require("./auth.route");
const userRoute = require("./user.route");
const loraRoute = require("./lora.route");

const router = express.Router();

const defaultRoutes = [
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/user",
    route: userRoute,
  },
  {
    path: "/lora",
    route: loraRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;

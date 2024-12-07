const express = require("express");
const route = express.Router();
const user = require("../controllers/userCtl");

//.......signup route............
route.post("/signup", user.signup);
route.post("/login",user.login)

module.exports = route;

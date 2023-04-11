const express = require("express");

const {
    register,
    login,
    getMe,
    forgotPassword } = require("../controllers/auth")

const router = express.Router();

const { protect } = require("../middleware/auth")


// params for all auth routers "/api/vi/auth" per server.js
router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe)
router.post("/forgotpassword", forgotPassword)


module.exports = router;
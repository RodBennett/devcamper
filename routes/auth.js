
const express = require("express");

const {
    register,
    login,
    logout,
    getMe,
    forgotPassword,
    resetPassword,
    updateDetails,
    updatePassword
} = require("../controllers/auth")

const router = express.Router();

const { protect } = require("../middleware/auth")


// params for all auth routers "/api/vi/auth" per server.js
router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/me", protect, getMe)
router.post("/forgotpassword", forgotPassword)
router.put("/resetpassword/:resettoken", resetPassword)
router.put("/updatedetails", protect, updateDetails)
router.put("/updatepassword", protect, updatePassword)


module.exports = router;
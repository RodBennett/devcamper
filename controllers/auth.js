const Bootcamp = require("../models/Bootcamp");
const Course = require("../models/Course")
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/asyncHandler");
const User = require("../models/User")

// @desc        Register user
// @route       POST /api/v1/auth/register
// @access      Public
exports.register = asyncHandler(async (req, res, next) => {
    // take the necessary fields out of the body in User model
    const { name, email, password, role } = req.body;

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        role
    });

    // Create token, sign token  ... you can test token at https://jwt.io/
    sendResponseToken(user, 200, res)

});

// @desc        Login user
// @route       POST /api/v1/auth/login
// @access      Public
exports.login = asyncHandler(async (req, res, next) => {
    // pull needed fields out of req.body
    const { email, password } = req.body;

    // Make sure user enters email and password 
    if (!email || !password) {
        return next(new ErrorResponse("Please enter an email and password", 400))
    };

    // find user in database by email
    const user = await User.findOne({ email }).select("+password")

    if (!user) {
        return next(new ErrorResponse("Please enter valid login credentials", 401))
    }

    // compare req.body password to hashed password in database (using middleware in User.js model)
    const isMatch = await user.matchPassword(password)

    if (!isMatch) {
        return next(new ErrorResponse("Please enter valid login credentials", 401))
    }
    // send token for each login
    sendResponseToken(user, 200, res)

})

// create cookie and send response 
const sendResponseToken = (user, statusCode, res) => {
    // get token from model
    const token = user.getSignedJwtToken()

    // set options for cookie for expiration and send to browser (http)
    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    }

    if (process.env.NODE_ENV === "production") {
        options.secure = true
    }
    res
        .status(statusCode)
        .cookie("token", token, options)
        .json({ success: true, token })
}

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
});

// @desc        Get loggedin user
// @route       GET /api/v1/auth/me
// @access      Private
exports.getMe = asyncHandler(async (req, res, next) => {
    // req.user is always the variable for loggedin user
    const user = await User.findById(req.user.id);

    res.status(200).json({ success: true, data: user })
    next();
});

// @desc        Forgot Password
// @route       GET /api/v1/auth/forgotpassword
// @access      Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    // req.user is always the variable for loggedin user
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorResponse("No user with that email", 404))
    }
    // getResetPasswordToken from User model 
    const resetToken = user.getResetPasswordToken();

    // save token to database
    await user.save({ validateBeforeSave: false })

    res.status(200).json({ success: true, data: user })
    next();
});


// create cookie and send response 
const sendResponseToken = (user, statusCode, res) => {
    // get token from model
    const token = user.getSignedJwtToken()

    // set options for cookie for expiration and send to browser (http)
    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    }
    // set conditional for production
    if (process.env.NODE_ENV === "production") {
        options.secure = true
    }
    // response
    res
        .status(statusCode)
        .cookie("token", token, options)
        .json({ success: true, token })
};



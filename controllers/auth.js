const Bootcamp = require("../models/Bootcamp");
const Course = require("../models/Course")
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/asyncHandler");
const User = require("../models/User")

// @desc        Register user
// @route       GET /api/v1/auth/register
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

    res.status(200).json({ success: true, data: user })
});


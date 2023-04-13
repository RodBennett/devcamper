const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/asyncHandler");
const User = require("../models/User");

// @desc        Get all users
// @route       GET /api/v1/auth/users
// @access      Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
    // take the necessary fields out of the body in User model
    res.status(200).json(res.advancedResults);
});

// @desc        Get one user
// @route       GET /api/v1/users/:id
// @access      Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id)
    // take the necessary fields out of the body in User model
    res.status(200).json({ success: true, data: user });
});

// @desc        Create new user
// @route       POST /api/v1/users
// @access      Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
    const user = await User.create(req.body)
    // take the necessary fields out of the body in User model
    res.status(200).json({ success: true, data: user });
});

// @desc        Update user
// @route       PUT /api/v1/users/:id
// @access      Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    }, {
        new: true,
        runValidators: true
    })
    // take the necessary fields out of the body in User model
    res.status(200).json({ success: true, data: user });
});

// @desc        Delete user
// @route       DELETE /api/v1/users/:id
// @access      Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
    await User.findByIdAndDelete(req.params.id)
    res.status(200).json({ success: true, data: {} });
});







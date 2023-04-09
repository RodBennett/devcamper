// imports
const jwt = require("jsonwebtoken");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("./asyncHandler");
const User = require("../models/User");


// Protect routes function with async
exports.protect = asyncHandler(async (req, res, next) => {
    // initialize token variable
    let token;

    // check for authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        // split method treats Bearer and token as an array [Bearer, token] so [1] is index of token
        token = req.headers.authorization.split(" ")[1]
    }
    // make sure token exists
    if (!token) {
        return next(new ErrorResponse("Not authorized to access this resource", 401))
    }
    try {
        // if token does exist, verify it
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded)

        // extract id from payload ... req.user will always be logged in user from now on
        // we use "id" instead of "_id" from model becasue this is from jwt library
        req.user = await User.findById(decoded.id);
        next();
    } catch (error) {
        console.log(error)
    }
});

// export "protect" function to bootcamp and course routes
// set up me auth/me route to get req.user in auth routes
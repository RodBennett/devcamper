// imports
const jwt = require("jsonwebtoken");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("./asyncHandler");
const User = require("../models/User");


// Protect routes function with async which pertains to all routes where login is necessary
exports.protect = asyncHandler(async (req, res, next) => {
    // initialize token variable
    let token;

    // check for authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {

        // split method treats Bearer and token as an array [Bearer, token] so [1] is index of token
        token = req.headers.authorization.split(" ")[1]
    } else if
        (req.cookies.token) {
            token = req.cookies.token
    }
    
    // make sure token exists
    if (!token) {
    return next(new ErrorResponse("Not authorized to access this resource", 401))
}
try {
    // if token does exist, verify it
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded)

    // extract id from payload ... req.user will be logged in user from now on
    // we use "id" instead of "_id" from model becasue this is from jwt library
    req.user = await User.findById(decoded.id);
    next();
} catch (error) {
    console.log(error)
}
});

// export "protect" function to bootcamp and course routes
// set up me auth/me route to get req.user in auth routes

// ROLE AUTHORIZATION

// create export function for auhthorization by role.
exports.auth = (...roles) => {
    return (req, res, next) => {

        if (!roles.includes(req.user.role)) {
            return next(new ErrorResponse(`User role ${req.user.role} is not authorized to access this route`, 403))
        }
        next();
    }
}
// check if req.user includes publisher role
// add authorize to auth routes
// test in postman to see if user and publisher have different results

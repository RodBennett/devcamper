const crypto = require("crypto");

const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/asyncHandler");
const User = require("../models/User");
const sendEmail = require("../utils/sendMail");

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
    role,
  });

  // Create token, sign token  ... you can test token at https://jwt.io/
  sendResponseToken(user, 200, res);
});

// @desc        Login user
// @route       POST /api/v1/auth/login
// @access      Public
exports.login = asyncHandler(async (req, res, next) => {
  // pull needed fields out of req.body
  const { email, password } = req.body;

  // Make sure user enters email and password
  if (!email || !password) {
    return next(new ErrorResponse("Please enter an email and password", 400));
  }

  // find user in database by email
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorResponse("Please enter valid login credentials", 401));
  }

  // compare req.body password to hashed password in database (using middleware in User.js model)
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse("Please enter valid login credentials", 401));
  }
  // send token for each login
  sendResponseToken(user, 200, res);
});

// @desc        Get loggedin user
// @route       GET /api/v1/auth/me
// @access      Private
exports.getMe = asyncHandler(async (req, res, next) => {
  // req.user is always the variable for loggedin user
  const user = await User.findById(req.user.id);

  res.status(200).json({ success: true, data: user });
  next();
});

// @desc        Update User Details (name, email)
// @route       PUT /api/v1/auth/updatedetails
// @access      Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  // declare fields to update
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };

  // await user with fields to update
  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  // add to routes
  // crate new PUT in postman

  // req.user is always the variable for loggedin user
  res.status(200).json({ success: true, data: user });
  next();
});

// @desc        Update Password
// @route       PUT /api/v1/auth/updatepassword
// @access      Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  // user enters current password first
  const user = await User.findById(req.user.id).select("+password")

  // check currect password to see if it matches
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse("Please enter correct password", 401))
  }

  // user creates new password
  user.password = req.body.newPassword

  // save new password to database via user
  await user.save();

  // send new token
  sendResponseToken(user, 200, res)
});


// @desc        Forgot Password
// @route       GET /api/v1/auth/forgotpassword
// @access      Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  // create variable to search db by email
  const user = await User.findOne({ email: req.body.email });

  // if no user throw error
  if (!user) {
    return next(new ErrorResponse("No user with that email", 404));
  }
  // getResetPasswordToken from User model
  const resetToken = user.getResetPasswordToken();

  // save token to database
  await user.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/resetpassword/${resetToken}`;

  // message for email
  const message = `You have requested a password reset.  Please make a PUT request to \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset Token",
      text: message,
    });
    res.status(200).json({ success: true, data: "Email Sent" });
  } catch (error) {
    console.log(error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse("Email could not be sent", 500));
  }
});

// @desc        Reset Password
// @route       GET /api/v1/auth/resetpassword/:resettoken
// @access      Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Get token out of database and hash it for matching in the database
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  // Get user by resetPasswordToken, and use $gt (greater than) to check that expiration is later than now
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse("Invalid token", 400));
  }
  // set the new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined; // undefined will delete it from db
  user.resetPasswordExpire = undefined;

  // save new password to the db
  await user.save();

  // call sendTokenResponse for new login token
  sendResponseToken(user, 200, res);
});

// create cookie and send response
const sendResponseToken = (user, statusCode, res) => {
  // get token from User model 
  const token = user.getSignedJwtToken();

  // set options for cookie for expiration and send to browser (http)
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  // set conditional for production
  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }
  // response
  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, token });
};

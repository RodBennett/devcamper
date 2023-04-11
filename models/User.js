const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// crypto is core node module
const crypto = require("crypto")

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add a name"],
    },
    email: {
        type: String,
        required: [true, "Please add an email"],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            "Please add a valid email",
        ],
    },
    role: {
        type: String,
        enum: ["user", "publisher"],
        default: "user",
    },
    password: {
        type: String,
        required: [true, "Please enter a valid password"],
        minlength: 6,
        // select: false means this info will not be displayed
        select: false,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Encrypt password
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

});

// Sign jwt and return token:  https://www.npmjs.com/package/jsonwebtoken
// methods is when you're calling on the actual user, not the model User as in "statics"
UserSchema.methods.getSignedJwtToken = function () {
    // Sign the user id
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    })
};

UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
};

UserSchema.methods.getResetPasswordToken = function () {
    // create reset password token
    const resetToken = crypto.randomBytes(10).toString("hex")

    // hash the token and set it to reset password reset token field
    this.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex")

    // set password expire for 10 minutes
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000

    return resetToken;
}

// Match user entered password with hashed password in db
module.exports = mongoose.model("User", UserSchema);

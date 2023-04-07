const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add a name"]
    },
    email: {
        type: String,
        required: [true, "Please enter a valid passoword"],
        unique: true,
        match: [/[a-z0-9.]{1,64}@[a-z0-9.]{1,64}/i, "Please add a valid email"],
    },
    role: {
        type: String,
        enum: ["user", "publisher"],
        default: "user"
    },
    password: {
        type: String,
        required: [true, "Please enter a valid password"],
        minlength: 6,
        // select: false means this info will not be displayed
        select: false
    },
    resetPassword: String,
    restPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("User", UserSchema)


const mongoose = require("mongoose");


const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Please add a course title"],
        maxlength: [50, "Title cannot be more that 50 characters"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "Please add a descritpion"],
        maxlength: [500, "Description cannot be moe than 500 chracters"],
    },
    weeks: {
        type: String,
        required: [true, "Please add number of weeks"]
    },
    tuition: {
        type: Number,
        required: [true, "Please add tuition cost"]
    },
    minimumSkill: {
        type: String,
        required: [true, "Please add minimum skill requirement"],
        enum: ["beginner", "intermediate", "advanced"],
    },
    scholarshipsAvailable: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    bootcamp: {
        type: mongoose.Schema.ObjectId,
        ref: "Bootcamp",
        required: true
    }
});

module.exports = mongoose.model("Course", CourseSchema);
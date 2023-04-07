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
        required: [true, "Please add a description"],
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

// Static method to get avg of course tutiions.  Satic methods are called directly on the model, not on the controller
CourseSchema.statics.getAverageCost = async function (bootcampId) {
    const obj = await this.aggregate([
        {
            $match: { bootcamp: bootcampId }
        },
        {
            $group: {
                _id: "$bootcamp",
                averageCost: { $avg: "$tuition" }
            }
        }
    ])
    try {
        await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
            averageCost: Math.ceil(obj[0].averageCost / 10) * 10
        })
    } catch (error) {
        console.log(error)
    }
}
// Call getAverage cost after save
CourseSchema.post("save", function () {
    this.constructor.getAverageCost(this.bootcamp)
})

// Call getAverage cost before remove
CourseSchema.pre("deleteOne", function () {
    this.constructor.getAverageCost(this.bootcamp)
})

module.exports = mongoose.model("Course", CourseSchema);
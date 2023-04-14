const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, "Please add a title"],
        maxlength: [50, "Title can only be 50 characters"]
    },
    text: {
        type: String,
        required: [true, "Please add a review"],
        maxlength: [1000, "1000 character maximum"]
    },
    rating: {
        type: Number,
        min: 1,
        max: 10,
        required: [true, "Please add a rating from 1-10"]
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    bootcamp: {
        type: mongoose.Schema.ObjectId,
        ref: "Bootcamp",
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    }
});

// Prevent user from submitting more than one review per bootcamp
ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

// Static used to get avg of course tuitions.  Satic methods are called directly on the model, not on the controller
ReviewSchema.statics.getAverageRating = async function (bootcampId) {
    const obj = await this.aggregate([
        {
            $match: { bootcamp: bootcampId }
        },
        {
            $group: {
                _id: "$bootcamp",
                averageRating: { $avg: "$rating" }
            }
        }
    ]);
    try {
        await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
            averageRating: obj[0].averageRating.toFixed(1)
        })
    } catch (error) {
        console.log(error)
    }
};
ReviewSchema.post("save", function () {
    this.constructor.getAverageRating(this.bootcamp)
})

// Call getAverage rating before remove
ReviewSchema.pre("deleteOne", function (next) {
    this.constructor.getAverageRating(this.bootcamp)
    next()
})



module.exports = mongoose.model("Review", ReviewSchema);
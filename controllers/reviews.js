const Bootcamp = require("../models/Bootcamp");
const User = require("../models/User")
const Review = require("../models/Review")
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/asyncHandler");

// @desc        Get all reviews for one bootcamp
// @route       GET /api/v1/reviews
// @route       GET /api/v1/bootcamps/:bootcampId/reviews
// @access      Public
exports.getReviews = asyncHandler(async (req, res, next) => {
    if (req.params.bootcampId) {
        const reviews = await Review.find({ bootcamp: req.params.bootcampId })

        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        })
    } else {
        res.status(200).json(res.advancedResults)
    }
});

// @desc        Get one review
// @route       GET /api/v1/reviews/:id
// @access      Public
exports.getReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id)
        .populate({
            path: "bootcamp",
            select: "name description"
        })
    if (!review) {
        return next(new ErrorResponse(`No review with id ${req.params.id}`))
    }
    res.status(200).json({
        success: true,
        data: review
    });
});

// @desc        Create new review for bootcamp
// @route       POST /api/v1/bootcamps/:bootcampId/reviews
// @access      Private
exports.createReview = asyncHandler(async (req, res, next) => {
    // puts user id on review
    req.body.user = req.user.id;
    // assigng review to one bootcamp only
    req.body.bootcamp = req.params.bootcampId

    const bootcamp = await Bootcamp.findById(req.params.bootcampId)
    if (!bootcamp) {
        return next(new ErrorResponse("That bootcamp doesn't exist", 404))
    }

    const review = await Review.create(req.body);

    res.status(201).json({
        success: true,
        data: review
    })
});

// @desc        Update review for bootcamp
// @route       PUT /api/v1/reviews/:id
// @access      Private
exports.updateReview = asyncHandler(async (req, res, next) => {
    let review = await Review.findById(req.params.id)

    if (!review) {
        return next(new ErrorResponse(`No review with that id ${req.params.id}`, 401))
    }

    if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this review`, 401))
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: review
    })
});

// @desc        Delete review for bootcamp
// @route       DELETE /api/v1/reviews/:id
// @access      Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
    let review = await Review.findById(req.params.id)

    if (!review) {
        return next(new ErrorResponse(`No review with that id ${req.params.id}`))
    }

    if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this review`, 401))
    }

    await review.deleteOne()

    res.status(200).json({
        success: true,
        data: {}
    })
});




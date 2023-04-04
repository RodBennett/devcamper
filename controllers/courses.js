const Course = require("../models/Course");
const Bootcamp = require("../models/Bootcamp")
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/asyncHandler");

const mongoose = require("mongoose");


// @desc        Get all courses
// @route       GET /api/v1/courses
// @route       GET /api/v1/bootcamps/:bootcampId/courses
// @access      Public
exports.getCourses = asyncHandler(async (req, res, next) => {
    let query;

    // req.params.bootcampId invokes the url params /:bootcampId 
    if (req.params.bootcampId) {

        // here the query links bootcamp field in Course model to bootcampId in the url params
        query = Course.find({ bootcamp: req.params.bootcampId })
    } else {
        // populate pulls data from "bootcamp" field in Course model
        query = Course.find().populate({
            path: "bootcamp", // path identifies whole field in Course model
            select: "name description location.city" // select operator in mongoose uses spaces
        })
        // the same can be accomplished with:
        // query = Course.find().populate("bootcamp", "name description location.city")
    }
    const courses = await query
    res.status(200).json({
        success: true,
        count: courses.length,
        data: courses
    })
});

// @desc        Get single course
// @route       GET /api/v1/courses/:id
// @access      Public
exports.getCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id).populate({
        path: "bootcamp",
        select: "name description city"
    });

    if (!course) {
        return next(
            new ErrorResponse(`No course found with id ${req.params.id}`, 404),
        );
    }
    res.status(200).json({
        success: true,
        data: course
    })
});

// @desc        Add a course
// @route       POST /api/v1/bootcamps/:bootcampId/courses
// @access      Private
exports.createCourse = asyncHandler(async (req, res, next) => {
    // req.body.bootcamp calls the field "bootcamp" in Course model, and links it to bootcampId in the url params
    req.body.bootcamp = req.params.bootcampId

    // bootcamp variable matches bootcampId extracted from Course model and pulls up that bootcamp
    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if (!bootcamp) {
        return next(
            new ErrorResponse(`No bootcamp with id ${req.params.bootcampId}`, 404)
        )
    }

    // now we can create our course within the correct bootcamp
    const course = await Course.create(req.body);

    res.status(201).json({ success: true, data: course })
});

// @desc        Update a course
// @route       PUT /api/v1/courses/:id
// @access      Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
    let course = await Course.findById(req.params.id)

    if (!course) {
        return next(
            new ErrorResponse(`No course found with id of ${req.params.id}`, 404)
        )
    }
    course = await Course.findByIdAndUpdate(
        req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(201).json({ success: true, data: course })
});

// @desc        Delete a course
// @route       DELETE /api/v1/courses/:id
// @access      Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
    let course = await Course.findByIdAndRemove(req.params.id)

    if (!course) {
        return next(
            new ErrorResponse(`No course found with id ${req.params.id}`, 404)
        )
    }

    res.status(200).json({ success: true, data: {} })

})


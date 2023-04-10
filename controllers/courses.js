const Course = require("../models/Course");
const Bootcamp = require("../models/Bootcamp")
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/asyncHandler");



// @desc        Get all courses
// @route       GET /api/v1/courses
// @route       GET /api/v1/bootcamps/:bootcampId/courses
// @access      Public
exports.getCourses = asyncHandler(async (req, res, next) => {
    if (req.params.bootcampId) {
        const courses = await Course.find({ bootcamp: req.params.bootcampId })

        res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        })
    } else {
        res.status(200).json(res.advancedResults)
    }
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
    req.body.user = req.user.id;

    // bootcamp variable matches bootcampId extracted from Course model and pulls up that bootcamp
    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if (!bootcamp) {
        return next(
            new ErrorResponse(`No bootcamp with id ${req.params.bootcampId}`, 404)
        )
    }
    // check if course creator is same user as bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
        return next(
            new ErrorResponse(`User ${req.user.id} is not authorized to create this course`, 401)
        );
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

    if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
        return next(
            new ErrorResponse(`User ${req.user.id} is not authorized to update this course`, 401)
        );
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

    if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
        return next(
            new ErrorResponse(`User ${req.user.id} is not authorized to update this course`, 401)
        );
    }


    res.status(200).json({ success: true, data: {} })

})


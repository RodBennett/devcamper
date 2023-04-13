const express = require("express");

const {
    getCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse,
} = require("../controllers/courses");

const Course = require("../models/Course")
const advancedResults = require("../middleware/advancedResults")

const { protect, auth } = require("../middleware/auth")

const router = express.Router({ mergeParams: true });

// this route will also take on "/:bootcampId/courses" route
router.route("/")
    .get(advancedResults(Course, {
        path: "bootcamp",
        select: "name description"
    }),
        getCourses
    )
    .post(protect, auth("publisher", "admin"), createCourse)

router.route("/:id")
    .get(getCourse)
    .put(protect, auth("publisher", "admin"), updateCourse)
    .delete(protect, auth("publisher", "admin"), deleteCourse)

module.exports = router;

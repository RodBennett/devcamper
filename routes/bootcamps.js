const express = require("express");

const {
    getBootcamps,
    getBootcamp,
    getBootcampsInRadius,
    createBootcamp,
    updateBootcamp,
    deleteBootcamp,
    bootcampUploadPhoto

} = require("../controllers/bootcamps");

const Bootcamp = require("../models/Bootcamp")
const { protect, auth } = require("../middleware/auth")
// advanced results middleware
const advancedResults = require("../middleware/advancedResults")

// Include other resource routers
const courseRouter = require("./courses")
const reviewRouter = require("./reviews")

const router = express.Router();

// Re-route into the courses routers
router.use("/:bootcampId/courses", courseRouter)
router.use("/:bootcampId/reviews", reviewRouter)

// "courses" is the populate parameter in advancedSearch function
router.route("/")
    .get(advancedResults(Bootcamp, "courses"), getBootcamps)
    // .get(advancedResults(Bootcamp, "reviews"), getBootcamps)
    .post(protect, auth("publisher", "admin"), createBootcamp);

router.route("/:id")
    .get(getBootcamp)
    .put(protect, updateBootcamp)
    .delete(protect, deleteBootcamp)

router.route("/radius/:zipcode/:distance").get(getBootcampsInRadius)

router.route("/:id/photo").put(protect, bootcampUploadPhoto)



module.exports = router;

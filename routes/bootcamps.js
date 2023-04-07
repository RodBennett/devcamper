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
// advanced results middleware
const advancedResults = require("../middleware/advancedResults")

// Include other resource routers
const courseRouter = require("./courses")

const router = express.Router();

// Re-route into the courses routers
router.use("/:bootcampId/courses", courseRouter)

// "courses" is the populate parameter in advancedSearch function
router.route("/").get(advancedResults(Bootcamp, "courses"), getBootcamps)
    .post(createBootcamp);

router.route("/:id").get(getBootcamp).put(updateBootcamp).delete(deleteBootcamp)

router.route("/radius/:zipcode/:distance").get(getBootcampsInRadius)

router.route("/:id/photo").put(bootcampUploadPhoto)

module.exports = router;

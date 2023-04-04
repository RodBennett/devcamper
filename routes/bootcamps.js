const express = require("express");

const {
    getBootcamps,
    getBootcamp,
    getBootcampsInRadius,
    createBootcamp,
    updateBootcamp,
    deleteBootcamp,

} = require("../controllers/bootcamps");

// Include other resource routers
const courseRouter = require("./courses")

const router = express.Router();

// Re-route into the courses routers
router.use("/:bootcampId/courses", courseRouter)

router.route("/").get(getBootcamps).post(createBootcamp);

router.route("/:id").get(getBootcamp).put(updateBootcamp).delete(deleteBootcamp)

router.route("/radius/:zipcode/:distance").get(getBootcampsInRadius)

module.exports = router;
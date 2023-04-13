const express = require("express");

const {
    getReviews,
    getReview,
    createReview,
    updateReview,
    deleteReview
} = require("../controllers/reviews")

const Review = require("../models/Review")
const advancedResults = require("../middleware/advancedResults")
const router = express.Router({ mergeParams: true });

const { protect, auth } = require("../middleware/auth")

router.route("/")
    .get(advancedResults(Review, {
        path: "bootcamp",
        select: "name description"
    }),
        getReviews
    ).post(protect, auth("user", "admin"), createReview)

router.route("/:id")
    .get(getReview)
    .put(protect, auth("user", "admin"), updateReview)
    .delete(protect, auth("user", "admin"), deleteReview)

module.exports = router;
const express = require("express");

const {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
} = require("../controllers/users");

const User = require("../models/User")
const advancedResults = require("../middleware/advancedResults");

const router = express.Router({ mergeParams: true });

const { protect, auth } = require("../middleware/auth")


router.use(protect);
router.use(auth("admin"))

router
    .route("/")
    .get(advancedResults(User), getUsers)
    .post(createUser)

router
    .route("/:id")
    .get(getUser)
    .put(updateUser)
    .delete(deleteUser)


module.exports = router;
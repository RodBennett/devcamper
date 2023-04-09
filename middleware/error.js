const ErrorResponse = require("../utils/errorResponse");

// mongoose errorHandler function, called in next() in controllers/bootcamps.js
function errorHandler(err, req, res, next) {
    let error = { ...err };
    error.message = err.message;
    // console.log(err) // by consoling the err, you can see the entire err object with name, message, value, valueType properties, etc

    // Mongoose check for bad ObjectId
    if (err.name === "CastError") {
        const message = `Bootcamp not found with id of ${err.value}`;
        // ErrorResponse class has parameters for (message, statusCode)
        error = new ErrorResponse(message, 404);
    } else if (
        // Mongoose check for duplicate keys
        // err.code 11000 is for duplicate keys
        err.code === 11000
    ) {
        const message = "Duplicate field name entered";
        error = new ErrorResponse(message, 400);
    } else if (err.name === "ValidationError") {
        const message = Object.values(err.errors).map((val) => val.message)
        // console.log("THIS IS MESSAGE", message)
        error = new ErrorResponse(message, 400)

        // if (!req.body.name) {
        //     const message = `${err.errors.name}`;
        //     error = new ErrorResponse(message, 404);
        // }
        // if (!req.body.address) {
        //     const message = `${err.errors.address}`;
        //     error = new ErrorResponse(message, 404);
        // }
        // if (!req.body.description) {
        //     const message = `${err.errors.description}`;
        //     error = new ErrorResponse(message, 404);
        // }
    }
    res
        .status(error.statusCode || 500)
        .json({ success: false, error: error.message || "Server error" });
}

module.exports = errorHandler;

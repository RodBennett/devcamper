// by importing the model, you are essentially connecting this file to the DB
const Bootcamp = require("../models/Bootcamp");
const ErrorResponse = require("../utils/errorResponse")

// @desc        Get all bootcamps
// @route       GET /api/v1/bootcamps
// @access      Public
exports.getBootcamps = async (req, res, next) => {
    try {
        const bootcamps = await Bootcamp.find();
        res.status(200).json({
            success: true,
            count: bootcamps.length,
            data: bootcamps,
        });
    } catch (err) {
        next(err)
    }
};

    // @desc        Get single bootcamp
    // @route       GET /api/v1/bootcamps/:id
    // @access      Public
    exports.getBootcamp = async (req, res, next) => {
        try {
            const bootcamp = await Bootcamp.findById(req.params.id);

            if (!bootcamp) {
                return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))

            }
            res.status(200).json({
                success: true,
                data: bootcamp
            });
        } catch (err) {
            // res.status(500).json({ success: false });
            next(err)
        }
    };

// @desc        Create new bootcamp
// @route       POST /api/v1/bootcamps
// @access      Private (requires auth token)
exports.createBootcamp = async (req, res, next) => {
    // can console body to get the added object with all fields from model in it
    // console.log(req.body)

    try {
        const bootcamp = await Bootcamp.create(req.body);
        // use res.status(201) for new resources
        res.status(201).json({
            success: true,
            data: bootcamp,
        });
    } catch (err) {
        next(err)
    }
};

// @desc        Update bootcamp
// @route       PUT /api/v1/bootcamps/:id
// @access      Private (requires auth token)
exports.updateBootcamp = async (req, res, next) => {
    try {
        const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!bootcamp) {
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
        }

        res.status(200).json({ success: true, data: bootcamp })
    } catch (err) {
        next(err)
    }
};

// @desc        Delete bootcamp
// @route       DELETE /api/v1/bootcamps/:id
// @access      Private (requires auth token)
exports.deleteBootcamp = async (req, res, next) => {
    try {
        const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

        if (!bootcamp) {
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
        }
        res
            .status(200)
            .json({ success: true, data: {} });

    } catch (err) {
        next(err)
    }
};

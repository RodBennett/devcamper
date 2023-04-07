// by importing the model, you are essentially connecting this file to the DB
const path = require("path")
const Bootcamp = require("../models/Bootcamp");
const Course = require("../models/Course")
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/asyncHandler");
const geocoder = require("../utils/geocoder")


// @desc        Get all bootcamps
// @route       GET /api/v1/bootcamps
// @access      Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  // res.adavncedResults is the object returned in advancedResults.js
  res.status(200).json(res.advancedResults);
});

// @desc        Get single bootcamp
// @route       GET /api/v1/bootcamps/:id
// @access      Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({
    success: true,
    data: bootcamp,
  });
});

// @desc        Create new bootcamp
// @route       POST /api/v1/bootcamps
// @access      Private (requires auth token)
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  // can console body to get the added object with all fields from model in it
  // console.log(req.body)

  const bootcamp = await Bootcamp.create(req.body);

  // use res.status(201) for new resources
  res.status(201).json({
    success: true,
    data: bootcamp,
  });

});

// @desc        Update bootcamp
// @route       PUT /api/v1/bootcamps/:id
// @access      Private (requires auth token)
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: bootcamp });
});

// @desc        Delete bootcamp
// @route       DELETE /api/v1/bootcamps/:id
// @access      Private (requires auth token)
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id)
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  await Course.deleteMany({ bootcamp: bootcamp._id })

  bootcamp.deleteOne();

  res.status(200).json({ success: true, data: {} });
});

// @desc        Upload photo for bootcamp
// @route       PUT /api/v1/bootcamps/:id/photo
// @access      Private (requires auth token)
exports.bootcampUploadPhoto = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id)
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  const file = req.files.file

  if (!req.files.file) {
    return next(new ErrorResponse(`Please upload a photo`, 400))
  }
  // this console returns an entire file object with many properties you can use to create standards for photos such as size and filetype 
  console.log(req.files.file)
  // Make sure file is a photo - check by mime type
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse("Please upload an image file"))
  }
  // Check file size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(new ErrorResponse(`Please make sure photo is smaller than ${process.env.MAX_FILE_UPLOAD}`))
  }

  // Create custom filename so many users can use photos named "bootcamp.jpeg", etc.
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    if (err) {
      console.log(err)
      return next(new ErrorResponse(`Problem with file upload`, 500))

    }
    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name })
    res.status(200).json({ success: true, data: file.name})
  });


});



// @desc        Get bootcamp within radius by miles
// @route       GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access      Private (requires auth token)

// see mongoDB docs on geosptaila querying here: https://www.mongodb.com/docs/manual/reference/operator/query-geospatial/

exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  // this line pulls zipcode and distance out of url
  const { zipcode, distance } = req.params;

  // get lat/lng from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // calc the radius using radians
  // Divide distance by radius of earth
  // Earth radius 3,963 miles / 6,378 km

  const radius = distance / 3963

  const bootcamps = await Bootcamp.find({
    location: {
      $geoWithin:
        { $centerSphere: [[lng, lat], radius] }
    }
  });

  if (!bootcamps) {
    new ErrorResponse(`No bootcamps not found within ${distance} miles of ${req.params.zipcode}`, 404)
  }

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps
  })
});


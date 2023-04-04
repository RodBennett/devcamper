// by importing the model, you are essentially connecting this file to the DB
const Bootcamp = require("../models/Bootcamp");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/asyncHandler");
const geocoder = require("../utils/geocoder")

// @desc        Get all bootcamps
// @route       GET /api/v1/bootcamps
// @access      Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  // req.query takes in fields requested by client.  Query string constructed with URL?params=&params=:
  // console.log(req.query)
  let query;
  // by destructuring, new variable reqQuery will not alter original req.query object
  const reqQuery = { ...req.query }

  // Fields to select out of req.query objects accoring to UI selection 
  const removeFields = ["select", "sort", "page", "limit"];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach(param => delete reqQuery[param]);

  // create query string
  let queryStr = JSON.stringify(reqQuery);

  // query operators: replace method takes in one arguments and replaces it with the second argument
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`
  )

  // console.log(queryStr) // returns JSON object with queryStr params
  query = Bootcamp.find(JSON.parse(queryStr)).populate("courses")

  // Select fields
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ")
    query = query.select(fields)
  }

  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ")
    query = query.sort(sortBy)
  } else {
    // sort -1 is descending, sort 1 is ascending ... set default sort by date
    query = query.sort("-createdAt")
  }

  // Pagination (10 in next two lines is radix for parseInt)
  const page = parseInt(req.query.page, 10) || 1
  const limit = parseInt(req.query.limit, 10) || 25
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const total = await Bootcamp.countDocuments();

  query = query.skip(startIndex).limit(limit)

  // Execute bootcmps query
  const bootcamps = await query

  // Pagination results
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    }
  }
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    }
  }

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    pagination,
    data: bootcamps,
  });
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
  const bootcamp = await Bootcamp.findByIdAndRemove(req.params.id)
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }
  // bootcamp.remove();

  res.status(200).json({ success: true, data: {} });
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


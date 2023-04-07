// middleware for all advanced search options as well as pagination

const advancedResults = (model, populate) => async (req, res, next) => {
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
    query = model.find(JSON.parse(queryStr))

    // Select fields
    if (req.query.select) {
        const fields = req.query.select.split(",").join(" ")
        query = query.select(fields)
    }
    // Sort
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

    const total = await model.countDocuments();

    query = query.skip(startIndex).limit(limit)

    if(populate) {
        query = query.populate(populate)
    }

    // Execute bootcmps query
    const results = await query

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
    res.advancedResults = {
        success: true,
        count: results.length,
        pagination,
        data: results
    }
    next()
}

module.exports = advancedResults
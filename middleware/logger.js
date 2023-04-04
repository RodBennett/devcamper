// middleware is a function that runs on all api request routes. Can be used for authentication on routes, for exmaple, tests to see if the user in logged in to have access to certain routes or data.

const logger = (req, res, next) => {
    console.log(`${req.method} ${req.protocol}://${req.get("host")}${req.originalUrl}`)
    next()
}

module.exports = logger;

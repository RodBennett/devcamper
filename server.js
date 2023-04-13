const path = require("path")
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db")
const colors = require("colors")
const fileupload = require("express-fileupload")
const errorHandler = require("./middleware/error")
const cookieParser = require("cookie-parser")
// morgan is middleware npm
const morgan = require("morgan");

// load env vars
dotenv.config({ path: "./config/config.env" });

connectDB();

// import routes for bootcamps
const bootcamps = require("./routes/bootcamps");
const courses = require("./routes/courses");
const auth = require("./routes/auth")
const users = require("./routes/users")
const reviews = require("./routes/reviews")

const app = express();

// body parser/ coookie parser middleware to read json
app.use(express.json());
app.use(cookieParser())

// Dev logger using morgan middleware logger ... (app.use() indicates middleware)
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

app.use(fileupload());

// Set static folder
app.use(express.static(path.join(__dirname, "public")))

// mount routers
app.use("/api/v1/bootcamps", bootcamps)
app.use("/api/v1/courses", courses)
app.use("/api/v1/auth", auth)
app.use("/api/v1/users", users)
app.use("/api/v1/reviews", reviews)

// calling error handler must come AFTER the route on line 29
app.use(errorHandler)
// middleware to handle ansynchronous code in our controllers

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT,
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold)
)

// GLOBAL handler of rejections from DB, etc
process.on("Unhandled rejection", (err, promise) => {
    console.log(`ERROR: ${err.message}`.red.underline)
    // close server & exit process
    server.close(() => process.exit(1))
})
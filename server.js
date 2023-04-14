const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const colors = require("colors");
const fileupload = require("express-fileupload");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");
const errorHandler = require("./middleware/error");
const cookieParser = require("cookie-parser");
// morgan is middleware npm
const morgan = require("morgan");

// load env vars
dotenv.config({ path: "./config/config.env" });

connectDB();

// import routes for bootcamps
const bootcamps = require("./routes/bootcamps");
const courses = require("./routes/courses");
const auth = require("./routes/auth");
const users = require("./routes/users");
const reviews = require("./routes/reviews");

const app = express();

// body parser/ coookie parser middleware to read json
app.use(express.json());
app.use(cookieParser());

// Dev logger using morgan middleware logger ... (app.use() indicates middleware)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(fileupload());

// sanitizing data against NoSQL injections
app.use(mongoSanitize());

// set security headers
app.use(helmet());

// Security againt xss attacks on <script> tags
app.use(xss());

// Set limit for the amount of requests per 10 minutes
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(limiter);

// set hpp pollution security
app.use(hpp());

app.use(cors());

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

// mount routers
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);
app.use("/api/v1/auth", auth);
app.use("/api/v1/users", users);
app.use("/api/v1/reviews", reviews);

// calling error handler must come AFTER the route mounters
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

// GLOBAL handler of rejections from DB, etc
process.on("Unhandled rejection", (err, promise) => {
  console.log(`ERROR: ${err.message}`.red.underline);
  // close server & exit process
  server.close(() => process.exit(1));
});

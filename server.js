const express = require("express");
const dotenv = require("dotenv");

// load env vars
dotenv.config({ path: "./config/config.env" })

const app = express();

const PORT = process.env.PORT || 5001;

app.get("/", (req, res) => {
    res.json({ success: true, message: "GET request working"})
})

app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
)
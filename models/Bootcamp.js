const slugify = require("slugify")
const geocoder = require("../utils/geocoder")

const mongoose = require("mongoose");

const BootcampSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add a name"],
        unique: true,
        trim: true,
        maxlength: [50, "Name cannot be more than 50 characters"],
    },
    // slug is a url friendly string to create hyperlinks from text
    slug: String,
    description: {
        type: String,
        required: [true, "Please write a brief description"],
        maxlength: [500, "Description cannot be more than 500 characters"],
    },
    website: {
        type: String,
        match: [
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
            "Please use a valid https url",
        ],
    },
    phone: {
        type: String,
        maxlength: [20, "Phone number cannot be more than 20 characters"],
    },
    email: {
        type: String,
        unique: true,
        match: [/[a-z0-9.]{1,64}@[a-z0-9.]{1,64}/i, "Please add a valid email"],
    },
    address: {
        type: String,
        required: [true, "Please add an address"],
    },
    // GEOjson point - see mongoose https://mongoosejs.com/docs/geojson.html for docs
    location: {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ["Point"], // 'location.type' must be 'Point'
            required: false
        },
        coordinates: {
            type: [Number],
            required: false,
            index: "2dsphere"
        },
        // will use MapQuest formats for addresses per below:
        formattedAddress: String,
        street: String,
        city: String,
        state: String,
        zipcode: String,
        country: String
    },
    careers: {
        type: [String],
        required: true,
        // enum property makes a list of options for user
        enum: [
            "Web Development",
            "Mobile Development",
            "UI/UX",
            "Data Science",
            "Business",
            "Other"
        ],
    },
    averageRating: {
        type: Number,
        min: [1, "Rating must be at least 1"],
        max: [10, "Rating cannot be more than 10"]
    },
    averageCost: Number,
    photo: {
        type: String,
        default: "no-photo.jpg"
    },
    housing: {
        type: Boolean,
        default: false
    },
    jobGuarantee: {
        type: Boolean,
        default: false
    },
    acceptGi: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// create bootcamp slug from the name (document middleware), slug is for creating URL friendly text wihtout spaces
BootcampSchema.pre("save", function (next) {

    // you can access any field in model with "this" keyword
    this.slug = slugify(this.name, { lower: true });// lower = lowercase
    next();
})

// GEOcode and create location field / pre refers to BEFORE SAVING to database
BootcampSchema.pre("save", async function (next) {
    const loc = await geocoder.geocode(this.address);
    this.location = {
        type: "Point",
        coordinates: [loc[0].longitude, loc[0].latitude],
        // all of these fields on the right side (streetName, etc, come from node-geocoder npm)
        formattedAddress: loc[0].formattedAddress,
        street: loc[0].streetName,
        city: loc[0].city,
        state: loc[0].stateCode,
        zipcode: loc[0].zipcode,
        country: loc[0].countryCode
    }

    // do not save address in db
    this.address = undefined
    next()
});

// Cascade delete courses when bootcamp is deleted
BootcampSchema.pre("remove", async function (next) {
    console.log(`Courses removed from bootcamp ${this._id}`)
    // this.model refers to Course, and deleteMany's params take in the bootcamp field from the Course model
    await this.model("Course").deleteMany({ bootcamp: this._id }) // bootcamp: this._id is Course model bootcamp field
    next();
});

// Reverse populate with virutals
BootcampSchema.virtual("courses", {
    ref: "Course",
    localField: "_id",
    foreignField: "bootcamp",
    justOne: false
});



module.exports = mongoose.model("Bootcamp", BootcampSchema)

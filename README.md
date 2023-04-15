# Devcamper API

## Overview 
> Backend REST API for searching bootcamp database by bootcamps and courses. Includes functionality for authenticated users to add, update and delete bootcamps and courses, and for public users to add, update, and delete reviews.

## Usage

Rename ```config/config.env.env``` to ```config/config.env``` and update the values/settings to your own.


## Install Dependencies

```npm install```

- Node.js
- Express.js
- MongoDB / Mongoose
- Morgan (http logger middleware npm)
- express-mongo-sanitize (sanitizes instances of "$" to prevent Mongo DB injection)
- express-rate-limit (limit cals to api, 100 per 10 minutes)
- Slugify (to create url friendly fields in models)
- Node-geocoder (for location and searching within radius)
- colors (for terminal color fonts)


## NPM Run App
```
# Run app in dev mode
npm run dev

# Run in prod mode
npm start
```

- Version: 1.0.0
- License: MIT


## Deployment
- Postman Documentation link: https://documenter.getpostman.com/view/26561902/2s93Xx1jRh
- Digital Ocean Droplet

## Credits
Traversy Media's Node.js master course, 2019: https://www.traversymedia.com/

## Contributors
Rod Bennett: rod.bennett75@gmail.com





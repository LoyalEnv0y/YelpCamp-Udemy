// Express
const express = require('express');
const router = express.Router();

// Cloudinary
const { storage } = require('../cloudinary');

// Multer
const multer = require('multer');
const upload = multer({ storage });

// Utils
const catchAsync = require('../utils/catchAsync');

// Middleware
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');

// Controllers
const campgrounds = require('../controllers/campgrounds');

// Routes
router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground));


router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router;
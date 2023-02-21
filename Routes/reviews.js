// Express
const express = require('express');
const router = express.Router({ mergeParams: true });

// Utils
const catchAsync = require('../utils/catchAsync');

// Middleware
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');

// Controllers
const reviews = require('../controllers/reviews');

// Routes
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;
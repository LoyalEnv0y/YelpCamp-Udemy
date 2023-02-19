// Express
const express = require('express');
const router = express.Router({ mergeParams: true });

// Utils
const catchAsync = require('../utils/catchAsync');

// Models
const Campground = require('../models/campground');
const Review = require('../models/review');

// Middleware
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');

// Routes
router.post('/', isLoggedIn, validateReview, catchAsync(async (req, res) => {
    const { id } = req.params;
    const foundCampground = await Campground.findById(id);
    const newReview = new Review(req.body.review);

    newReview.author = req.user._id;

    foundCampground.reviews.push(newReview);
    await newReview.save();
    await foundCampground.save();

    req.flash('success', 'Created a new review!');
    res.redirect(`/campgrounds/${id}`)
}));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    req.flash('success', 'Successfully deleted review');
    res.redirect(`/campgrounds/${id}`);
}));

module.exports = router;
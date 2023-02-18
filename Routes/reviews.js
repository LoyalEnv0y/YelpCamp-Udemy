// Express
const express = require('express');
const router = express.Router({ mergeParams: true });

// Utils
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

// Models
const Campground = require('../models/campground');
const Review = require('../models/review');

// JOI Validators
const { reviewSchema } = require('../schemas.js');

// Middleware
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);

    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }

    next();
}

// Routes
router.post('/', validateReview, catchAsync(async (req, res) => {
    const { id } = req.params;
    const foundCampground = await Campground.findById(id);
    const newReview = new Review(req.body.review);

    foundCampground.reviews.push(newReview);
    await newReview.save();
    await foundCampground.save();

    req.flash('success', 'Created a new review!');
    res.redirect(`/campgrounds/${id}`)
}));

router.delete('/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    req.flash('success', 'Successfully deleted review');
    res.redirect(`/campgrounds/${id}`);
}));

module.exports = router;
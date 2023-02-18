// Express
const express = require('express');
const router = express.Router();

// Utils
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

// Models
const Campground = require('../models/campground');

// JOI Validators
const { campgroundSchema } = require('../schemas.js');

// Middleware
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);

    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }

    next();
}

// Routes
router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find();
    res.render('campgrounds/index', { title: 'Campgrounds | All', campgrounds });
}));

router.get('/new', (req, res) => {
    res.render('campgrounds/new', { title: 'Campgrounds | New', });
});

router.post('/', validateCampground, catchAsync(async (req, res) => {
    const newCamp = new Campground(req.body.campground);
    await newCamp.save();
    res.redirect(`/campgrounds/${newCamp._id}`);
}));

router.get('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const foundCampground = await Campground.findById(id).populate('reviews');

    if (!foundCampground) {
        throw new ExpressError(`Cannot find a campground with this id: ${id}`, 404);
    }

    res.render('campgrounds/show', { title: 'Campgrounds | Details', campground: foundCampground });
}));

router.get('/:id/edit', catchAsync(async (req, res) => {
    const { id } = req.params;
    const foundCampground = await Campground.findById(id);
    res.render('campgrounds/edit', { title: 'Campgrounds | Edit', campground: foundCampground });
}));

router.put('/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { runValidators: true });
    res.redirect(`/campgrounds/${id}`);
}));

router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));

module.exports = router;
// Express
const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const port = 3000;

// Utils
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');

// ejs
const ejsMate = require('ejs-mate');

// Mongoose
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const { campgroundSchema } = require('./schemas.js');

// Below line is only here for the mongoose 6 error. 
// You might not need this in the future.
mongoose.set('strictQuery', true);

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
        .then(() => console.log('Mongodb connection successful'));
}
main().catch(() => console.log('Mongodb connection failed'));

// Configs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', ejsMate);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);

    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    }

    next();
}

// Routes
app.get('/', (req, res) => {
    res.render('home', { title: 'YelpCamp | Home' });
});

app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find();
    res.render('campgrounds/index', { title: 'Campgrounds | All', campgrounds });
}));

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new', { title: 'Campgrounds | New', });
});

app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
    const newCamp = new Campground(req.body.campground);
    await newCamp.save();
    res.redirect(`/campgrounds/${newCamp._id}`);
}));

app.get('/campgrounds/:id', catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const foundCampground = await Campground.findById(id);

    if (!foundCampground) {
        throw new ExpressError(`Cannot find a campground with this id: ${id}`, 404);
    }

    res.render('campgrounds/show', { title: 'Campgrounds | Details', campground: foundCampground });
}));

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const { id } = req.params;
    const foundCampground = await Campground.findById(id);
    res.render('campgrounds/edit', { title: 'Campgrounds | Edit', campground: foundCampground });
}));

app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { runValidators: true });
    res.redirect(`/campgrounds/${id}`);
}));

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));

app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404));
});

app.use((err, req, res, next) => {
    const { status = 500 } = err;
    if (!err.message) err.message = 'Oh no! Something went wrong..'

    res.status(status).render('error', { title: 'Error', err });
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
// Express
const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Utils
const ExpressError = require('./utils/ExpressError');

// Ejs
const ejsMate = require('ejs-mate');
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Mongoose
const mongoose = require('mongoose');

mongoose.set('strictQuery', true);
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp',)
        .then(() => console.log('Mongodb connection successful'));
}
main().catch(() => console.log('Mongodb connection failed'));

// Routers
const campgroundsRoutes = require('./Routes/campgrounds');
const reviewRoutes = require('./Routes/reviews');

app.use('/campgrounds', campgroundsRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

// Routes
app.get('/', (req, res) => {
    res.render('home', { title: 'YelpCamp | Home' });
});

// Error Handlers
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
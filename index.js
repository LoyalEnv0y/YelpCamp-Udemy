if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

// Express
const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Sessions
const session = require('express-session');
const sessionConfig = {
    secret: 'This should be a better secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));

// Flash
const flash = require('connect-flash');
app.use(flash());

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

const User = require('./models/user');

// Passport
const passport = require('passport');
const localStrategy = require('passport-local');

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// Routers
const campgroundRoutes = require('./Routes/campgrounds');
const reviewRoutes = require('./Routes/reviews');
const userRoutes = require('./Routes/users');

app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes);

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
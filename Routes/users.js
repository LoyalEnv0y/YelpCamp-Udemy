// Express
const express = require('express');
const router = express.Router();

// Utils
const catchAsync = require('../utils/catchAsync');

// Passport
const passport = require('passport');

// Models
const User = require('../models/user');

// Routes
router.get('/register', (req, res) => {
    res.render('users/register', { title: 'Register' });
});

router.post('/register', catchAsync(async (req, res) => {
    try {
        const { email, username, password } = req.body;

        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);

        req.login(registeredUser, err => {
            if (err) return next(err);
        });

    } catch (err) {
        req.flash('error', err.message);
        return res.redirect('/register');
    }

    req.flash('success', 'Welcome to Yelp Camp!');
    res.redirect('/campgrounds');
}));

router.get('/login', (req, res) => {
    res.render('users/login', { title: 'Log in' });
});

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login', keepSessionInfo: true }), (req, res) => {
    req.flash('success', 'Welcome back!');

    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
});

router.get('/logout', (req, res) => {
    if (!req.isAuthenticated()) return res.redirect('/campgrounds');

    req.logOut((err) => {
        if (err) return next(err);

        req.flash('success', 'Goodbye..');
        res.redirect('/campgrounds');
    });

});

module.exports = router;
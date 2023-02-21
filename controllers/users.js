const User = require('../models/user');

module.exports.renderRegisterForm = (req, res) => {
    res.render('users/register', { title: 'Register' });
}

module.exports.register = async (req, res) => {
    try {
        const { email, username, password } = req.body;

        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);

        req.login(registeredUser, err => {
            if (err) { return next(err); }
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        });

    } catch (err) {
        req.flash('error', err.message);
        return res.redirect('/register');
    }
}

module.exports.renderLoginForm = (req, res) => {
    res.render('users/login', { title: 'Log in' });
}

module.exports.login = (req, res) => {
    req.flash('success', 'Welcome back!');

    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res) => {
    if (!req.isAuthenticated()) return res.redirect('/campgrounds');

    req.logOut((err) => {
        if (err) return next(err);

        req.flash('success', 'Goodbye..');
        res.redirect('/campgrounds');
    });
}
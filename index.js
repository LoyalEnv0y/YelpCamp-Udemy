// Express
const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const port = 3000;

// ejs
const ejsMate = require('ejs-mate');

// Mongoose
const mongoose = require('mongoose');
const Campground = require('./models/campground');

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

// Routes
app.get('/', (req, res) => {
    res.render('home', {title: 'YelpCamp | Home'})
});

app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find();
    res.render('campgrounds/index', { title: 'Campgrounds | All', campgrounds });
})

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new', {title: 'Campgrounds | New',});
});

app.post('/campgrounds', async (req, res) => {
    const newCamp = new Campground(req.body.campground);
    await newCamp.save();
    res.redirect(`/campgrounds/${newCamp._id}`);
});

app.get('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    const foundCampground = await Campground.findById(id);
    res.render('campgrounds/show', { title: 'Campgrounds | Details', campground: foundCampground });
});

app.get('/campgrounds/:id/edit', async (req, res) => {
    const { id } = req.params;
    const foundCampground = await Campground.findById(id);
    res.render('campgrounds/edit', {title: 'Campgrounds | Edit', campground: foundCampground });
})

app.put('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { runValidators: true });
    res.redirect(`/campgrounds/${id}`)
})

app.delete('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

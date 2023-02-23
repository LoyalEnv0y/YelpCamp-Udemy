const Campground = require('../models/campground');

// Cloudinary
const { cloudinary } = require('../cloudinary');

// MapBox
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_PUBLIC_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find();
    res.render('campgrounds/index', { title: 'Campgrounds | All', campgrounds });
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new', { title: 'Campgrounds | New', });
}

module.exports.createCampground = async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()

    const newCamp = new Campground(req.body.campground);

    newCamp.geometry = geoData.body.features[0].geometry;
    newCamp.author = req.user._id;
    newCamp.images = req.files.map(file => ({ url: file.path, filename: file.filename }));
    
    await newCamp.save();

    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${newCamp._id}`);
}

module.exports.showCampground = async (req, res) => {
    const { id } = req.params;
    const foundCampground = await Campground.findById(id)
        .populate({ path: 'reviews', populate: { path: 'author' } })
        .populate('author');

    if (!foundCampground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }

    res.render('campgrounds/show', { title: 'Campgrounds | Details', campground: foundCampground });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const foundCampground = await Campground.findById(id);

    if (!foundCampground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { title: 'Campgrounds | Edit', campground: foundCampground });
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const foundCampground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { runValidators: true });

    if (req.files.length > 0) {
        const images = req.files.map(file => ({ url: file.path, filename: file.filename }))
        foundCampground.images.push(...images);
    }

    await foundCampground.save();

    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }

        await foundCampground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }

    req.flash('success', 'Successfully updated campground!')
    res.redirect(`/campgrounds/${id}`);
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    const foundCampground = await Campground.findByIdAndDelete(id);

    for (let image of foundCampground.images) {
        await cloudinary.uploader.destroy(image.filename);
    }

    req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds');
}
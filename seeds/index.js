if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const axios = require('axios');
const { places, descriptors } = require('./seedHelpers');

// Cloudinary
const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

// MapBox
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_PUBLIC_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

// Below line is only here for the mongoose 6 error. 
// You might not need this in the future.
mongoose.set('strictQuery', true);

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
        .then(() => console.log('Mongodb connection successful'));
}
main().catch(() => console.log('Mongodb connection failed'));


const getSample = array => array[Math.floor(Math.random() * array.length)];

const uploadImage = async imagePath => {
    try {
        const result = await cloudinary.uploader.upload(imagePath, { folder: 'YelpCamp' });
        return result;
    } catch (err) {
        console.log("Error at uploadImage => ", err);
    }
}

const seedImg = async () => {
    const randImgCount = Math.floor(Math.random() * 3) + 1;
    const pickedImages = [];

    for (let i = 0; i < randImgCount; i++) {
        try {
            const resp = await axios.get('https://api.unsplash.com/photos/random', {
                params: {
                    client_id: process.env.UNSPLASH_CLIENT_ID,
                    collections: 9046579,
                    orientation: 'landscape'
                },
            })
            const uploadedImage = await uploadImage(resp.data.urls.small);
            pickedImages.push({ url: uploadedImage.url, filename: uploadedImage.public_id });
        } catch (err) {
            console.error(err)
        }
    }

    return pickedImages;
}

const clearPhotosFromCloudinary = async () => {
    const oldCampgrounds = await Campground.find();

    if (oldCampgrounds.length < 1) return;

    for (let campground of oldCampgrounds) {
        campground.images.forEach(async image => {
            await cloudinary.uploader.destroy(image.filename);
        })
    }
}

const getGeoLocation = async (location) => {
    const geoData = await geocoder.forwardGeocode({
        query: location,
        limit: 1
    }).send()

    return geoData.body.features[0].geometry;
}

const seedDB = async () => {
    await clearPhotosFromCloudinary();
    await Campground.deleteMany({});

    for (let i = 0; i < 16; i++) {
        const randCity = getSample(cities),
            randPlace = getSample(places),
            randDesc = getSample(descriptors),
            randImgs = await seedImg(),
            randPrice = Math.floor(Math.random() * 20) + 10;

        const randLocation = `${randCity.city}, ${randCity.state}`;

        const newCamp = new Campground({
            // For testing purposes. Below, write the admin id form mongo.
            author: '63f2205d98385ed4ffa8413c',
            location: randLocation,
            title: `${randDesc} - ${randPlace}`,
            description: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Debitis, nihil tempora vel aspernatur quod aliquam illum! Iste impedit odio esse neque veniam molestiae eligendi commodi minus, beatae accusantium, doloribus quo!',
            price: randPrice,
            images: randImgs,
            geometry: await getGeoLocation(randLocation)
        });

        await newCamp.save()
            .then(() => console.log(`Camp #${i + 1} has been saved`))
            .catch((err) => console.log(`Error couldn't save camp #${i + 1} ERROR => ${err}`));
    }
};

seedDB().then(() => mongoose.connection.close());
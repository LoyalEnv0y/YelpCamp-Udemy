const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');

// Below line is only here for the mongoose 6 error. 
// You might not need this in the future.
mongoose.set('strictQuery', true);

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
        .then(() => console.log('Mongodb connection successful'));
}
main().catch(() => console.log('Mongodb connection failed'));


const getSample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    console.log('**************************Before**************************')

    await Campground.deleteMany({});

    for (let i = 0; i < 50; i++) {
        const randCity = getSample(cities);
        const randPlace = getSample(places);
        const randDesc = getSample(descriptors);

        const newCamp = new Campground({
            location: `${randCity.city}, ${randCity.state}`,
            title: `${randDesc} - ${randPlace}`
        })

        await newCamp.save()
            .then(() => console.log(`Camp #${i + 1} has been saved`))
            .catch((err) => console.log(`Error couldn't save camp #${i + 1} ERROR => ${err}`));

    }

    console.log('**************************After**************************')
};

seedDB().then(() => mongoose.connection.close());
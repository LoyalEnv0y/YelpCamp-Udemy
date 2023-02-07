const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const axios = require('axios');
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

const seedImg = async () => {
    try {
        const resp = await axios.get('https://api.unsplash.com/photos/random', {
            params: {
                client_id: 'CXimG27-pMORG2cPnCdKWRseFl_ELGHfoplZnuwr3DE',
                collections: 9046579,
                orientation: 'landscape'
            },
        })
        return resp.data.urls.small
    } catch (err) {
        console.error(err)
    }
}

const seedDB = async () => {
    await Campground.deleteMany({});

    for (let i = 0; i < 30; i++) {
        const randCity = getSample(cities),
            randPlace = getSample(places),
            randDesc = getSample(descriptors),
            randImg = await seedImg(),
            randPrice = Math.floor(Math.random() * 20) + 10;

        const newCamp = new Campground({
            location: `${randCity.city}, ${randCity.state}`,
            title: `${randDesc} - ${randPlace}`,
            description: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Debitis, nihil tempora vel aspernatur quod aliquam illum! Iste impedit odio esse neque veniam molestiae eligendi commodi minus, beatae accusantium, doloribus quo!',
            price: randPrice,
            image: randImg
        });

        await newCamp.save()
            .then(() => console.log(`Camp #${i + 1} has been saved`))
            .catch((err) => console.log(`Error couldn't save camp #${i + 1} ERROR => ${err}`));

    }
};

seedDB().then(() => mongoose.connection.close());
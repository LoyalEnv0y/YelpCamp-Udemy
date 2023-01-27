const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.get('/', (req, res) => {
    res.render('home')
});



app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

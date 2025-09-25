const express = require('express'); 
const PORT = 3000;

const app = express();

app.use(express.urlencoded({ extended: false }));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    console.log("Server available on ");
    res.render('home');
});
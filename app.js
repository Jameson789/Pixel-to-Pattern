const express = require('express'); 
const PORT = 3000;

const app = express();

app.use(express.urlencoded({ extended: false }));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('home');
});


app.listen(PORT, () => {
    console.log(`Running on port http://localhost:${PORT}` );
});
import express from 'express';
//import mariadb from 'mariadb';
const PORT = 3000;

const app = express();

app.use(express.urlencoded({ extended: false }));

app.set('view engine', 'ejs');

// const pool = mariadb.createPool({
//     host: 'localhost',
//     user: 'root',
//     database: 'portfolio',
//     password: '1234'
// });

// async function connect() {
//     try {
//         const conn = await pool.getConnection();
//         console.log("Connected to mariaDB");
//         return conn;
//     } catch (err) {
//         console.log('Error connecting to MariaDB: ' + err);
//     }
// }; 

app.get('/', async (req, res) => {
    res.render('home');
});

app.listen(PORT, () => {
    console.log(`Running on port http://localhost:${PORT}` );
});
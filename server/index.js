const express = require('express');
const spreadsheet = require('./spreadsheet');
const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
   res.header('Access-Control-Allow-Origin', 'http://localhost:63342');
   next();
});

app.get('/hunt/credentials',
    (req, res) => spreadsheet.credentials()
        .then(obj => res.send(JSON.stringify(obj))));

app.get('/hunt/leaderboard',
    (req, res) => spreadsheet.leaderboard()
        .then(obj => res.send(JSON.stringify(obj))));

app.listen(PORT, () => console.log('hello'));
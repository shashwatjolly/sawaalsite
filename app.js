const express = require('express');
const path = require('path');
const app = express();
app.set('view engine', 'ejs');
app.use('/assets', express.static('./assets/'))
const server = app.listen(7000, () => {
    console.log(`Express running → PORT ${server.address().port}`);
});
app.get('/', (req, res) => {
    res.render('index');
});
app.get('/index', (req, res) => {
    res.render('index');
});
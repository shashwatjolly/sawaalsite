const express = require('express');
const path = require('path');
const firebase = require('firebase');

const app = express();
app.set('view engine', 'ejs');
app.use('/assets', express.static('./assets/'))
const server = app.listen(7000, () => {
    console.log(`Express running → PORT ${server.address().port}`);
});

// Configuring firebase.
var firebaseApp = firebase.initializeApp({
    apiKey: "AIzaSyAAqzctObFVSwj4YVwJh6NMARNTKqJCFFQ",
    authDomain: "sawaal-sgsj.firebaseapp.com",
    databaseURL: "https://sawaal-sgsj.firebaseio.com",
    projectId: "sawaal-sgsj",
    storageBucket: "sawaal-sgsj.appspot.com",
    messagingSenderId: "1086466113456",
    appId: "1:1086466113456:web:a4af7708fa679df8f4e075"
});
var databaseRef = firebaseApp.database();

app.get('/', (req, res) => {
    res.render('form');
});
app.get('/index', (req, res) => {
    res.render('index');
});
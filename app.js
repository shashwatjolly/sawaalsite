const express = require('express');
const path = require('path');
const firebase = require('firebase');
const bodyParser =  require('body-parser');

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

// To parse form data.
var urlencodedParser = bodyParser.urlencoded({ extended: false })

function getUserMail(){
    return "shaurya.gomber98@iitg.ac.in";
}

function isInArray(value, array) {
    return array.indexOf(value) > -1;
  }

function getPapersByYear(years,referString,res,loggedInUser){
    var locks = [];
    var papers = [];

    for(var i=0;i<years.length;i++){
        locks.push(false);
    }

    var displayYear = years.length > 1; 

    for(var i=0;i<years.length;i++){

        var refString = `${referString}/${years[i]}`;
        var paperRef = databaseRef.ref(refString);

        const copy = i;
        paperRef.orderByChild("totalVotes").once("value").then(function(snapshot,i) {
            
            snapshot.forEach(function(child) {
                var paper = child.val();
                paper.key = child.key;

                var upvoters = paper.upvoters;
                var downvoters = paper.downvoters;

                paper.hasupvoted = isInArray(loggedInUser,upvoters);
                paper.hasdownvoted = isInArray(loggedInUser,downvoters); 

                papers.unshift(paper);
            });

            if(displayYear){
                var yearObj = {};
                yearObj.isYear = true;
                yearObj.year = years[copy];
                papers.unshift(yearObj);
            }

            locks[copy] = true;

            var done = true;
            for(var j=0;j<years.length;j++){
                done = done && locks[j]; 
                console.log(`${j},${locks[j]}`);
            }

            console.log(done);
            if(done){
                res.render('index', {"papers":papers});
            }
            
            }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
    }
}

app.get('/', (req, res) => {
    res.render('form');
});

app.post('/', urlencodedParser, (req, res) => {
    console.log(req.body);
    const code = req.body.code;
    const type = req.body.type;
    const year = req.body.year;

    var loggedInUser = getUserMail();
    
    if(year != ""){
        var referString = `Uploads/${code}_${type}/${year}`;
        var papersRef = databaseRef.ref(referString);
        

        papersRef.orderByChild("totalVotes").once("value").then(function(snapshot) {
            var papers = [];
            snapshot.forEach(function(child) {
                var paper = child.val();
                paper.key = child.key;

                var upvoters = paper.upvoters;
                var downvoters = paper.downvoters;

                paper.hasupvoted = isInArray(loggedInUser,upvoters);
                paper.hasdownvoted = isInArray(loggedInUser,downvoters); 

                papers.unshift(paper);
            });
            res.render('index' , {"papers":papers});
            }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
    
    }
    else{
        var referString = `Uploads/${code}_${type}`;
        var yearsRef = databaseRef.ref(referString);

        const years = [];
        yearsRef.once("value").then(function(snapshot) {
            snapshot.forEach(function(child) {
                years.push(child.key);
            });
            
            console.log(years);
            getPapersByYear(years,referString,res,loggedInUser);
            }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
    }
});

app.get('/index', (req, res) => {
    res.render('index');
});
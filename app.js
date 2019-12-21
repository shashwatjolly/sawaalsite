const express = require('express');
const session = require('express-session');
const firebase = require('firebase');
const bodyParser =  require('body-parser');

const app = express();
app.set('view engine', 'ejs');
app.use(session({secret: 'sawaal'}));
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

function getPapersByYear(years,referString,req,res){
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
                req.session.papers = papers;
                res.redirect('list');
            }
            
            }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
    }
}

app.get('/', (req, res) => {
    res.render('form');
});

app.get('/list', (req, res) => {
    var papers = req.session.papers;
    res.render('index', {"papers": papers});
})

app.post('/', urlencodedParser, (req, res) => {
    console.log(req.body);
    const ccode = req.body.code;
    const code = ccode.toUpperCase().replace(/\s/g, '');;
    const type = req.body.type;
    const year = req.body.year;

    console.log(req.user);    
    if(year != ""){
        var referString = `Uploads/${code}_${type}/${year}`;
        var papersRef = databaseRef.ref(referString);
        

        papersRef.orderByChild("totalVotes").once("value").then(function(snapshot) {

            if(!snapshot.exists()){
                console.log("Here!!");
                res.redirect('#nopaper');
            }


            var papers = [];
            snapshot.forEach(function(child) {
                var paper = child.val();
                paper.key = child.key;
                papers.unshift(paper);
            });
            req.session.papers = papers;
            res.redirect('list');
            }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
    
    }
    else{
        var referString = `Uploads/${code}_${type}`;
        var yearsRef = databaseRef.ref(referString);

        const years = [];
        yearsRef.once("value").then(function(snapshot) {

            if(!snapshot.exists()){
                console.log("Here1!!");
                res.redirect('#nopaper');
            }

            snapshot.forEach(function(child) {
                years.push(child.key);
            });
            
            console.log(years);
            getPapersByYear(years,referString,req,res);
            }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
    }
});

app.get('/leaderboard', (req, res) => {
    var MATERIAL = [
        "e57373",
        "f06292",
        "ba68c8",
        "9575cd",
        "7986cb",
        "64b5f6",
        "4fc3f7",
        "4dd0e1",
        "4db6ac",
        "81c784",
        "aed581",
        "ff8a65",
        "d4e157",
        "ffd54f",
        "ffb74d",
        "a1887f",
        "90a4ae"
    ];
    hashCode = function(s) {
        var h = 0, l = s.length, i = 0;
        if ( l > 0 )
            while (i < l)
            h = (h << 5) - h + s.charCodeAt(i++) | 0;
        return h;
    }
    getSrc = function(email, name) {
        var hashcode = hashCode(email);
        var col = MATERIAL[Math.abs(hashcode)%MATERIAL.length];
        var words = name.split(" ");
        var tname = words[0] + "+" + words[words.length-1];
        var src = "https://ui-avatars.com/api/?background=" + col + "&color=fff&rounded=true&name=" + tname;
        return src;
    }
    var referString = `Users`;
    var usersRef = databaseRef.ref(referString);
    var users = [];
    var query = usersRef.orderByChild("Score");
    query.on("value", function(snapshot){
        snapshot.forEach(function(child) {
            var user = child.val();
            users.push(user);
        });
        users = users.reverse();
        console.log(users);
        res.render('leaderboard', {"users": users});    
        }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    }); 
});

app.get('/profile', (req, res) => {
    res.render('profile');
});

app.get('/about', (req, res) => {
    res.render('about');
});
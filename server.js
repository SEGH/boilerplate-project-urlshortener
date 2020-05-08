'use strict';
//Require dependencies
var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
const bodyParser = require('body-parser');
var cors = require('cors');
const shortid = require('shortid');
const dns = require('dns');
var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true});
app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({extended: false}));
//Serve assets
app.use('/public', express.static(process.cwd() + '/public'));
//Serve html
app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

//Check for connections...
app.listen(port, function () {
  console.log('Node.js listening ...');
});
console.log(mongoose.connection.readyState);

//Set up Schema
const Schema = mongoose.Schema;
const urlSchema = new Schema({
  "original_url": {type: String, required: true},
  "short_url": {type: String, required: true}
});
const Url = mongoose.model('Url', urlSchema);


//I can POST a URL to [project_url]/api/shorturl/new and I will receive a shortened URL in the JSON response.
app.post("/api/shorturl/new", (req, res) => {
  const url = req.body.url;
  //This variable generates a short url.
  const shortUrl = shortid.generate();
  //make regex to check w/o http...
  const safeUrl = url.replace(/^(https?:\/\/)/, "");
  //If I pass an invalid url,  it will return an error.
  dns.lookup(safeUrl, (err, address) => {
    if (err) {
      return res.json({"error": "invalid URL"});
      //If valid, it will run the function to make and save new url and shorturl.
    } else {
      createAndSaveUrl();
    }
  });
  
//Make function to check if url is already in database.
  /*
const checkAndDecide = function() {
  let urlOne = /^(https?:\/\/)/i;
  let urlTwo = /^(https?:\/\/www.)/i;
  if (url.search(urlTwo) > 0) {
  ***if Url.find === [] ?
    Url.find({"original_url": url}, (err, data) => {
      if (err) {
        return err;
      } else {
        return res.json(data);
      }
    });
  } else if (url.search(urlOne) > 0) {
    
  }  
}*/
//This is the function to create and save the url and its shorturl together.
  const createAndSaveUrl = function() {
    const docInst = new Url({"original_url": url, "short_url": shortUrl});
    const docInstHttp = new Url({"original_url": "http://" + url, "short_url": shortUrl});
    if (url.search(/^(https?:\/\/)/) === -1) {
      docInstHttp.save((err, data) => {
        if (err) {
          return res.json(err);
        } else {
          return res.json(data);
        }
      })
    } else {
        docInst.save((err, data) => {
          if(err) {
            return res.json(err);
          } else {
            return res.json(data);
          }
        });
    }
  }; 
});

//When I visit the shortened Url, it will redirect me to my original link.
app.get("/api/shorturl/:thisHereUrl", (req, res) => {
  const thisUrl = req.params.thisHereUrl;
  Url.find({"short_url": thisUrl}, (err, data) => {
    if (err) {
      return err;
    } else {
      //res.json(data[0]["original_url"]);
      res.redirect(data[0]["original_url"]);
    }
  })
});


/*
Url.deleteMany({"original_url": 'http://www.freecodecamp.org'}, (err) => {
  if (err) return err;
})
*/
Url.find({}, (err, data) => {
if (err) {
  return err;
} else {
  console.log(data);
}
});
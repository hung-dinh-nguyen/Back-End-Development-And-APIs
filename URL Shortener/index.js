require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser'); 
const dns = require('dns');
const window = require('window');
const open = require('open');
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Basic Configuration


const urlSchema = new mongoose.Schema({
  original_url: {
    type: String,
    required: true
  },
    
  short_url: {
    type: String,
    required: true,
    unique: true
  }
});

const Url = mongoose.model("Url", urlSchema);

const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(bodyParser.urlencoded({extended: false}));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint

app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// Post URL to db  

app.post('/api/shorturl', async (req, res) => {

  let dbCount = await Url.countDocuments({});
  
  console.log(dbCount);
  
  var url = req.body.url;

  try {
    urlObj = new URL(url);
    hostname = urlObj.hostname; 
  }
  catch (error) {
    hostname = 'invalid URL';
  } 
  
  console.log(hostname)
  
  dns.lookup(hostname, (error) => {
    if (error) {
      res.json({"error": 'invalid url'});
    } 
    else {
      var resMessage = {
        "original_url": url, 
        "short_url": dbCount
      }; 

      res.json(resMessage); 

      var urlDoc = new Url(resMessage);
      urlDoc.save(function(err) {
        if (err) return console.error(err); 
      });
    };
  });


});

// Go to short URL 

app.get('/api/shorturl/:short_url', (req, res) => {
  const urlLink = req.params.short_url;
  console.log(urlLink); 
  
  Url.findOne({"short_url": urlLink}, (err, urlObj) => {
    if (err) return console.error(err); 
    console.log(urlObj.original_url);
    res.redirect(urlObj.original_url);
  });
});



app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

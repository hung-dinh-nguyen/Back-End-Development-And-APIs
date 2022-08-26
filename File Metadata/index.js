var express = require('express');
var cors = require('cors');
const bodyParser = require('body-parser'); 
const fs = require('fs');
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const path = require('path')
require('dotenv').config({path: path.resolve(__dirname, '../.env')});

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });


var app = express();

app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));

app.use(bodyParser.urlencoded({extended: false}));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/fileanalyse', upload.single("upfile"), (req, res) => {
  console.log(req.file);
  let name = req.file.originalname;
  let type = req.file.mimetype; 
  let size = req.file.size;
  
  res.json({
    name: name,
    type: type, 
    size: size
  });
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Your app is listening on port ' + port)
});

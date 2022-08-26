const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser'); 
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
require('dotenv').config()

// Basic Config
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.use(bodyParser.urlencoded({extended: false}));

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

// Model Setup 

//// User Model
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true, 
    unique: true
  },
  log: [""]
});


const User = mongoose.model("User", userSchema); 

//// Exercise Model
const exerciseSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number, 
    required: true
  },
  date: {
    type: String
  }
});

const Exercise = mongoose.model("Exercise", exerciseSchema); 

// POST to /api/users

app.post('/api/users', async (req, res) => {
  var username = req.body.username; 
  
  let newUser = {'username': username};
  
  var userDoc = new User(newUser); 
  
  userDoc.save((err, user) => {
    if (err) return console.error(err); 
    res.json({'username': user.username, '_id': user._id});
  });
});

// Respond w/ List of all users 
app.get('/api/users', (req, res) => {
  User.find({})
  .select('_id username')
  .exec( (err, doc) => {
    if (err) return console.error(err); 
    res.json(doc); 
  });
});

// POST exercise object to /api/users/:_id/exercises

app.post('/api/users/:_id/exercises', async (req, res) => {  
  var id = req.params._id;  
  var description = req.body.description; 
  var duration = req.body.duration; 

  if (req.body.date != undefined) {
    var date = new Date(req.body.date); 
  }
  else {
    var date = new Date(); 
  }

  exerciseObj = {
    description: description,
    duration: duration,
    date: date.toDateString()
  };

  exerciseDoc = new Exercise(exerciseObj); 
  exerciseDoc.save((err, exercise) => {
    if (err) return console.error(err); 
    User.findById(id, (err, user) => {
      if (err) return console.error(err); 
      user.log.push(exercise);; 

      user.save((err, newUser) => {
        if (err) return console.error(err); 
        let response = {
          username: newUser.username,
          description: exercise.description,
          duration: exercise.duration,
          date: exercise.date,
          _id: newUser._id
        };
        res.json(response); 
      });
    });
  }); 
});


app.get('/api/users/:_id/logs', async (req, res) => {  
  var id = req.params._id;  

  let from = req.query.from;
  let to = req.query.to; 
  let limit = req.query.limit; 
  
  if (from == undefined) {
    fromDate = new Date(-8640000000000000);
  }
  else {
  let fromDate = new Date(from);  
  };
  
  if (to == undefined) {
    toDate = new Date(8640000000000000);
  }
  else {
  let toDate = new Date(to);  
  };
  
  User.findById(id, (err, user) => {
    if (err) return console.error(err);
    
      function selectLogParam(log) {
        const {description, duration, date } = log;
        return {description, duration, date};
      };
      
      var sortedLogs = user.log.map(selectLogParam);
      console.log(sortedLogs);

     
      var datedLogs = sortedLogs.filter((logs) => { 
      var date = new Date(logs.date);
      return (fromDate <= date && date <= toDate)
      });

      finalLogs = datedLogs.slice(0,limit);
    
      let count = user.log.length; 
      let response = {
        username: user.username,
        count: count,
        _id: user._id,
        log: finalLogs
      }; 
      console.log(response);
      res.json(response); 
  });
}); 
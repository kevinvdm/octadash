//This is the subscriber

var mqtt    = require('mqtt');
var client  = mqtt.connect('mqtt://vanhooydonck.nu:1883');
var mongodb = require('mongodb');
var express = require('express');
var mongoose = require('mongoose');
var Light = require('./model/db.js');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var mongodbClient=mongodb.MongoClient;
var mongodbURI='mongodb://localhost:27017/lightdb'
var collection;

var app = express();
mongoose.connect('mongodb://localhost:27017/lightdb');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 443;

var passport = require('passport');
var expressSession = require('express-session');



var router = express.Router();

router.use(function(req, res, next) {
    console.log('Route busy...');
    next();
});

router.route('/data')

//    // create a datapoint (accessed at POST http://localhost:8080/api/data)
//    .post(function(req, res) {
//
//        var data = new Light();      // create a new instance of the Bear model
//        data.lightamount = req.body.lightamount;  // set the bears name (comes from the request)
//
//        // save the data and check for errors
//        data.save(function(err) {
//            if (err)
//                res.send(err);
//
//            res.json({ message: 'Data created!' });
//        });
//
//    })

    // get all the data (accessed at GET http://localhost:8080/api/data)
    .get(function(req, res) {
        Light.find(function(err, data) {
            if (err)
                res.send(err);
            res.json(data);
        });
    });

// on routes that end in /users/:user_id
router.route('/data/:device_id')

    // get the datapoint with that id (accessed at GET http://localhost:8080/api/bears/:bear_id)
    .get(function(req, res) {
        Light.findById(req.params.device_id, function(err, data) {
            if (err)
                res.send(err);
            res.json(data);
        });
    })

     // update the data with this id (accessed at PUT http://localhost:8080/api/data/:device_id)
    .put(function(req, res) {

        // use our data model to find the data we want
        Light.findById(req.params.device_id, function(err, data) {

            if (err)
                res.send(err);

            data.lightamount = req.body.lightamount;

            data.save(function(err) {
                if (err)
                    res.send(err);

                res.json({ message: 'Data updated!' });
            });

        });
    })

    .delete(function(req, res) {
        Light.remove({
            _id: req.params.device_id
        }, function(err, data) {
            if (err)
                res.send(err);

            res.json({ message: 'User successfully deleted' });
        });
    });

//subscribe to MQTT topic and automatically put data into MongoDB collection "lights in lightdb"
client.subscribe('lightmeasuring');

mongodbClient.connect(mongodbURI,setupCollection);

function setupCollection(err,db) {
  if(err) throw err;
  collection=db.collection("testcollection");
  client.subscribe('lightmeasuring')
  client.on('message', function(topic, message) {
    var datastream = message.toString('hex');
    var filteredstring;
    if (datastream.length == 82)
    {
      filteredstring = datastream;
    }
    console.log(filteredstring);
    if (filteredstring != null)
    {
    collection.update(
  { _id:"ArduinoLightSensor" },
  { $push: {events: { value:filteredstring, when:new Date(), id:filteredstring.substring(12,28)} } } ,
  { upsert:true },
  function(err,docs) {
    if(err) { console.log("Insert fail"); } // Improve error handling
  }
)}
});
}
app.use(express.static('public'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use('/api', router);
app.get('/', function(req, res) {
        res.sendFile('.public/index.html', {'root': __dirname}); // load the single view file (angular will handle the page changes on the front-end), {'root': __dirname}
    });

app.use(expressSession({secret: 'mySecretKey'}));
app.use(passport.initialize());
app.use(passport.session());

// Initialize Passport
var initPassport = require('./public/passport/init.js');
initPassport(passport);



var routes = require('./public/routes/index.js')(passport);
app.use('/', routes);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}
module.exports = app;
// START THE SERVER
app.listen(port);
console.log('Magic happens on port ' + port);

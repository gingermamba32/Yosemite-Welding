var express = require('express');
var router = express.Router();
var path = require('path');
var nodemailer = require('nodemailer');
var busboy          = require('connect-busboy');
var fs              = require('fs');
var mongoose = require('mongoose');
//var imageMagick     = gm.subClass({ imageMagick: true }),  //for the heroku dependencies


// Database
try{
	var uristring = require('./password.js').mongo;
}
catch(err){
	console.log("no connection file so go on to Heroku config var");
	var uristring = process.env.MONGOLAB_URI;   //if Heroku env set the config variable
}
console.log("uristring is "+ uristring);

mongoose.connect( uristring, function (err,res){
	if (err) {
		console.log('err');
	}
	else{
		console.log('success');
	}
})

// Mongoose schema


// heroku statuc file server
process.env.PWD = process.cwd()

/* GET home page. */
var html_dir = '../views/';
router.get('/', function(req, res, next) {
	res.sendFile(path.join(process.env.PWD+'/index.html'));
  //res.sendFile('/Users/michaelmontero/Desktop/StoreFrontTemplate/views/index.html');
});

router.get('/about-us', function(req, res, next) {
	res.sendFile(path.join(process.env.PWD+'/about-us.html'));
  //res.sendFile('/Users/michaelmontero/Desktop/StoreFrontTemplate/views/index.html');
});
router.get('/contact-us', function(req, res, next) {
	res.sendFile(path.join(process.env.PWD+'/contact-us.html'));
  //res.sendFile('/Users/michaelmontero/Desktop/StoreFrontTemplate/views/index.html');
});
router.get('/sucess', function(req, res, next) {
	res.sendFile(path.join(process.env.PWD+'/success.html'));
  //res.sendFile('/Users/michaelmontero/Desktop/StoreFrontTemplate/views/index.html');
});

router.get('/portfolio', function(req, res, next) {
	res.sendFile(path.join(process.env.PWD+'/success.html'));
  //res.sendFile('/Users/michaelmontero/Desktop/StoreFrontTemplate/views/index.html');
});

router.get('/upload', function(req, res, next) {
	res.sendFile(path.join(process.env.PWD+'/upload.html'));
  //res.sendFile('/Users/michaelmontero/Desktop/StoreFrontTemplate/views/index.html');
});

// Set up the sender......



// Create a new email account to send these correctly


router.post('/send', function(req, res, next){
	console.log(req.body.email + 'sfsdfsdfsdf');

	var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL, // Your email id
            pass: process.env.PASSWORD // Your password
        }
    });

	var mailOptions = {
    from: req.body.email, // sender address
    to: 'michaelm@beautyindustrygroup.com', // list of receivers
    subject: 'Re: Contact Us -> ' + req.body.name + '/'+ req.body.email + ':' + req.body.subject, // Subject line
    text: req.body.message
	};

	transporter.sendMail(mailOptions, function(error, info){
    if(error){
        console.log(error);
        res.json({error: 'Please contact us here!'});
    } else{
        console.log('Message sent: ' + info.response);
        res.redirect('/success');
    	};
	});

})

router.post('/upload', function(req, res, next) {
	console.log(req.body);
	console.log(req.body.title + 'sfdsfdsf');
	var fstream;
    req.pipe(req.busboy);

    req.busboy.on('field', function(fieldname, val) {
     console.log(fieldname, val);
     req.body[fieldname] = val;
   });

    req.busboy.on('file', function (fieldname, file, filename) {
        console.log("Uploading: " + filename); 
        //console.log(req.body);
        fstream = fs.createWriteStream('./public/uploads/' + filename);
        file.pipe(fstream);

        // save file url
        console.log("Uploading: " + filename);
        console.log(req.body.title + 'It works');


        fstream.on('close', function () {
            res.redirect('/success.html');
        });
    });

})

module.exports = router;

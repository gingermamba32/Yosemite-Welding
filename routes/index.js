var express = require('express');
var router = express.Router();
var path = require('path');
var nodemailer = require('nodemailer');


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
        res.redirect('/success.html');
    	};
	});




})

module.exports = router;

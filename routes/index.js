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
// db schema for the locations collection
var imageSchema = new mongoose.Schema({ 
	title: {
		type: String,
		default: ''
	}	,
	text: {
		type: String,
		default: ''
	}	,
	type: {
		type: String,
		default: ''
	}	,
	link: {
		type: String,
		default: ''
	}	,
	imgurl: {
		type: String,
		default: ''
	}	
});

var Images = mongoose.model('photos', imageSchema);


// heroku statuc file server
process.env.PWD = process.cwd()

/* GET home page. */
var html_dir = '../views/';

router.get('/', function(req, res, next) {
	res.sendFile(path.join(process.env.PWD+'/index.html'));
  //res.sendFile('/Users/michaelmontero/Desktop/StoreFrontTemplate/views/index.html');
});

router.get('/portfolio', function(req, res, next) {
	Images.find({type: 'portfolio'}, function(err, docs){

		console.log(docs + 'XXXXXXXXX');

		res.render('portfolio', {'nums': docs});
	})

	
});

router.get('/upload', function(req, res, next) {
	Images.find().sort({type: 1}).exec(function(err, docs){

		console.log(docs + 'XXXXXXXXX');

		res.render('upload', {'nums': docs});
	});

	
});

router.get('/services', function(req, res, next) {
	Images.find({type: 'services'}, function(err, docs){

		console.log(docs + 'XXXXXXXXX');

		res.render('our-services', {'nums': docs});
	})

	
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
    to: 'mary@yosemitewelding.com', // list of receivers
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

router.post('/portfolioupload', function(req, res, next) {
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
        var newurl = '/uploads/' + filename;
        console.log(req.body.title + 'It works');
        console.log(req.body.link + 'It works');
        var newimage = new Images({
        	title: req.body.title,
        	type: 'portfolio',
        	link: req.body.link,
        	imgurl: newurl
        })


        fstream.on('close', function () {
        	newimage.save(function(err, callback){

            res.redirect('/portfolio');
        	});
        });
    });

})

router.post('/serviceupload', function(req, res, next) {
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
        var newurl = '/uploads/' + filename;
        console.log(req.body.title + 'It works');
        console.log(req.body.link + 'It works');
        var newimage = new Images({
        	title: req.body.title,
        	text: req.body.text,
        	type: 'services',
        	link: req.body.link,
        	imgurl: newurl
        })


        fstream.on('close', function () {
        	newimage.save(function(err, callback){

            res.redirect('/services');
        	});
        });
    });

});

router.get('/deletepost/:id', function(req, res){
	Images.remove({ _id: req.params.id }, function(err, docs){
		res.redirect('/upload');
	});
});

router.get('/updatepost/:id', function(req,res){
        Images.find({_id: req.params.id}, function(err, docs){
        console.log(docs + ' User to edit');
        res.render('updateportfolio', { post:docs } );
    });
});


router.post('/update', function(req, res){
    console.log(req.body.id + ' Hello XXXXXXXXXXXX');
    Images.findOneAndUpdate(
        {_id: req.body.id},
        {$set: {
                    _id             : req.body.id,
                    title           : req.body.title,
                    text            : req.body.text,
                    type            : req.body.type,
                    link            : req.body.link,
                    imgurl          : req.body.imgurl 
            }}, 
            {upsert: false} , function(err, docs) {
                res.redirect('upload'); 
            });
});  


module.exports = router;

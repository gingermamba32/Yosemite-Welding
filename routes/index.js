var express = require('express');
var router = express.Router();
var path = require('path');
var nodemailer = require('nodemailer');
var busboy          = require('connect-busboy');
var fs              = require('fs');
var mongoose = require('mongoose');
var cloudinary = require('cloudinary');
//var imageMagick     = gm.subClass({ imageMagick: true }),  //for the heroku dependencies

// cloudinary config.....need config variable and hide the cloudinary criteria
cloudinary.config({ 
  cloud_name: 'gingermamba32', 
  api_key: '513139441632682', 
  api_secret: 'NkHTHliVuwat9Y05H1dFPf53gvU' 
});



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
});

// ADMIN USER
var hardadminperson = "admin";
var hardadminpass = "Pa55word!?";
var cookieTime;

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

router.get('/uploadSuccess', function(req, res, next) {
    Images.find().sort({type: 1}).exec(function(err, docs){

        console.log(docs + 'XXXXXXXXX');

        res.render('uploadSuccess', {'nums': docs});
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
    console.log(process.env.EMAIL);
    console.log(process.env.PASSWORD);
	var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL, // Your email id
            pass: process.env.PASSWORD // Your password
        }
    });

	var mailOptions = {
    from: req.body.email, // sender address
    to: 'info@yosemitewelding.com', // list of receiver smary@yosemitewelding.com
    subject: 'Re: Contact Us -> ' + req.body.name + '/'+ req.body.email + ':' + req.body.subject, // Subject line
    text: req.body.message
	};

	transporter.sendMail(mailOptions, function(error, info){
    if(error){
        console.log(error);
        res.redirect('error');
    } else{
        console.log('Message sent: ' + info.response);
        res.redirect('/success.html');
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

        // save image to cdn
        cloudinary.uploader.upload('public/uploads/' + filename, function(result) { 
          var newurl = result.secure_url;

          console.log(req.body.title + 'It works');
          console.log(req.body.link + 'It works');

            var newimage = new Images({
                title: req.body.title,
                type: 'portfolio',
                link: req.body.link,
                imgurl: newurl
            });

            newimage.save(function(err, callback){
                if (err) {console.log(err)};
                console.log('success');
            });

        });

        fstream.on('close', function () {
            res.redirect('/portfolio');
        	
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

                // save image to cdn
        cloudinary.uploader.upload('public/uploads/' + filename, function(result) { 
          var newurl = result.secure_url;

          console.log(req.body.title + 'It works');
          console.log(req.body.link + 'It works');

            var newimage = new Images({
                title: req.body.title,
                type: 'services',
                link: req.body.link,
                imgurl: newurl
            });

            newimage.save(function(err, callback){
                if (err) {console.log(err)};
                console.log('success');
            });

        });

        fstream.on('close', function () {
            res.redirect('/portfolio');
            
        });
    });

});

router.get('/deletepost/:id', function(req, res){
	Images.remove({ _id: req.params.id }, function(err, docs){
		res.redirect('/uploadSuccess');
	});
});

router.get('/updatepost/:id', function(req,res){
        Images.find({_id: req.params.id}, function(err, docs){
        console.log(docs + ' User to edit');
        res.render('updateportfolio', { post:docs } );
    });
});

// include the updating the image and its url
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
                res.redirect('uploadSuccess'); 
            });
});  


router.post('/login', function(req, res){
    console.log(req.body.username);
    console.log(req.body.password);

    var username = req.body.username;
    var password = req.body.password;
    if (verifyuser(username, password)) {

        console.log(username + " " + password + " is user ");
        res.cookie('username', req.body.username);
        res.cookie('password', req.body.password);
        res.cookie('datecookie', Date.now());
        res.redirect('uploadSuccess');

        }
    else {
        console.log("not a valid login "); 
        res.redirect('error')
    }
    
});

// used for valid cookie verification
function verifyuser (username, password){
    if ( (username === hardadminperson) && (password === hardadminpass ) ) 
        {loggedin = true;}
    else
        {loggedin = false;}
    return loggedin;
}

// used for valid login for hours ************************
function recent (cookieTime){
    if ( (Date.now() - cookieTime ) <= 3600000 ) {
        return true;
    }
}

module.exports = router;

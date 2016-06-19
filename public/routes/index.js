var express = require('express');
var router = express.Router();

function loggedIn(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect('/');
    }
}

module.exports = function(passport){

	/* GET login page. */
	router.get('/', function(req, res) {
    	// Display the Login page with any flash message, if any
		res.render('index.html');
	});

	/* Handle Login POST */
	router.post('/login', passport.authenticate('login', {
		successRedirect: './dashboard.html',
		failureRedirect: './index.html',
		failureFlash : true  
	}));

	/* Handle Registration POST */
	router.post('/signup', passport.authenticate('signup', {
		successRedirect: './dashboard.html',
		failureRedirect: './index.html',
		failureFlash : true  
	}));

	/* GET Home Page */
	router.get('/dashboard', loggedIn, function(req, res){
		successRedirect: './dashboard.html'
	});
    
    router.get('/user', loggedIn, function(req, res){
		res.send(req.user);
	});

	/* Handle Logout */
	router.get('/signout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	return router;
}
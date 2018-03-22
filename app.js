const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const nunjucks = require('nunjucks');
const port = 8999;

const app = express();

function checkAuth (req, res, next) {
	console.log('checkAuth ' + req.url);

	// don't serve /secure to those not logged in
	// you should add to this list, for each and every secure url
	if (req.url === '/secure' && (!req.session || !req.session.authenticated)) {
		res.render('unauthorised', { status: 403 });
		return;
	}

	next();
}
nunjucks.configure('views', {
	express: app
});

app.use(cookieParser());
app.use(session({ 
	secret: 'cats',
	resave: false,
	saveUninitialized: true,
}));
app.use(flash());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'html');
app.set('view options', { layout: false });
app.use(checkAuth);

app.get('/', function (req, res, next) {
	res.render('index');
}); 

app.get('/welcome', function (req, res, next) {
	res.render('welcome');
});

app.get('/secure', function (req, res, next) {
	res.render('secure');
});

app.get('/login', function (req, res, next) {
	res.render('login', { flash: req.flash() } );
});

app.post('/login', function (req, res, next) {

	// you might like to do a database look-up or something more scalable here
	if (req.body.username && req.body.username === 'user' && req.body.password && req.body.password === 'pass') {
		req.session.authenticated = true;
		res.redirect('/secure');
	} else {
		req.flash('error', 'Username and password are incorrect');
		res.redirect('/login');
	}

});

app.get('/logout', function (req, res, next) {
	delete req.session.authenticated;
	res.redirect('/');
});

app.listen(port);
console.log('Node listening on port %s', port);

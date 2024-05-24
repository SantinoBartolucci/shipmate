const express = require('express');
const path = require('path');
const { engine } = require('express-handlebars');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash'); //Mensajes FLash

//Initializations
const app = express();
const PORT = 3000;

require('./database');
require('./config/passport');

//Settings
app.set('port', process.env.PORT || PORT);
app.set('views', path.join(__dirname, 'views'));
app.engine(
	'.hbs',
	engine({
		defaultLayout: 'main',
		layoutsDir: path.join(app.get('views'), 'layouts'),
		partialsDir: path.join(app.get('views'), 'partials'),
		extname: '.hbs',
		runtimeOptions: {
			allowProtoPropertiesByDefault: true,
			allowProtoMethodsByDefault: true,
		},
	})
);
app.set('view engine', '.hbs');

//Middlewars
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
	session({
		secret: 'mySecretApp',
		resave: true,
		saveUninitialized: true,
	})
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//Global Variables
app.use((req, res, next) => {
	res.locals.success_msg = req.flash('success_msg'); //Success Message
	res.locals.error_msg = req.flash('error_msg'); //Error message
	res.locals.user = req.user || null;
	next();
});

//Routes
app.use(require('./routes/index'));
app.use(require('./routes/login'));
app.use(require('./routes/profile'));

//Static Files
app.use(express.static(path.join(__dirname, 'public')));

//Server Initialization
app.listen(app.get('port'), () => {
	console.log(`Server on port ${app.get('port')} on http://localhost:${app.get('port')}`);
});

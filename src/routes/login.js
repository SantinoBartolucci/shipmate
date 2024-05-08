const { Router } = require('express');
const passport = require('passport');
const router = Router();

const pool = require('../database');
const helper = require('../helpers/bcrypt');
const nodeMailer = require('../helpers/nodeMailer');
const { isNotLoggedIn } = require('../helpers/isLogged');

router.get('/signup', isNotLoggedIn, (req, res) => {
	const { name, mail } = req.session;
	res.render('login/signup', { layout: 'loginform', name: name, mail: mail });
});

router.post('/signup', async (req, res, next) => {
	const { name, mail, password, repeatPassword } = req.body;

	req.session.name = name;
	req.session.mail = mail;
	req.session.password = password;

	const user = await pool.query('SELECT name FROM usuario WHERE mail=?', [mail]);

	if (user[0]) {
		req.session.name = req.session.mail = req.session.password = null;
		req.flash('error_msg', 'El email ya esta siendo utilizado');
		res.redirect('/signup');
	} else if (password != repeatPassword) {
		req.session.password = null;
		req.flash('error_msg', 'Las contraseñas no son iguales');
		res.redirect('/signup');
	} else {
		res.redirect('/signup/emailconfirmation');
	}
});

router.get('/signup/emailconfirmation', async (req, res) => {
	const mail = req.session.mail;
	const confirmationCode = await nodeMailer.SendConfirmationEmail(mail);

	req.session.confirmationCode = confirmationCode;

	res.render('login/emailconfirmation', { layout: 'loginform' });
});	

router.post('/signup/emailconfirmation', async (req, res) => {
	const { confirmationCode } = req.body;
	const { name, mail, password } = req.session;
	let encryptedPassword = await helper.encryptPassword(password);

	const realCode = req.session.confirmationCode;
	req.session.confirmationCode = null;

	if (confirmationCode == realCode) {
		await pool.query(
			'INSERT INTO usuario (name, mail, password) VALUES (?, ?, ?)',
			[name, mail, encryptedPassword]
		);

		res.redirect('/signin');
	} else {
		req.flash('error_msg', 'El codigo ingresado es incorrecto. Ingrese el nuevo codigo enviado');
		res.redirect('/signup/emailconfirmation');
	}
});

router.get('/signin', isNotLoggedIn, (req, res) => {
	res.render('login/signin', { layout: 'loginform' });
});

router.post(
	'/signin',
	passport.authenticate('local.signin', {
		successRedirect: '/',
		failureRedirect: '/signin',
	})
);

router.get('/auth/google', isNotLoggedIn, passport.authenticate('google', { scope: ['email', 'profile'] }));

router.get(
	'/auth/google/callback',
	passport.authenticate('google', {
		successRedirect: '/',
		failureRedirect: 'signin',
	})
);

module.exports = router;

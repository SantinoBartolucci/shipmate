const { Router } = require('express');
const passport = require('passport');
const router = Router();

const pool = require('../database');
const helper = require('../helpers/bcrypt');
const nodeMailer = require('../helpers/nodeMailer');
const { isLoggedIn, isNotLoggedIn } = require('../helpers/isLogged');

router.get('/signup', isNotLoggedIn, (req, res) => {
	const { name, mail } = req.session;
	res.render('pages/login/signup', { layout: 'loginform', name: name, mail: mail });
});

router.post('/signup', async (req, res, next) => {
	const { name, mail, password, repeatPassword } = req.body;


	req.session.name = name;
	req.session.mail = mail.toLowerCase();
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

	res.render('pages/login/emailconfirmation', { layout: 'loginform' });
});

router.post('/signup/emailconfirmation', async (req, res) => {
	const { confirmationCode } = req.body;
	const { name, mail, password } = req.session;
	let encryptedPassword = await helper.encryptPassword(password);

	const realCode = req.session.confirmationCode;
	req.session.confirmationCode = null;

	if (confirmationCode == realCode) {
		const Name = name.split(' ');
		await pool.query('INSERT INTO usuario (name, mail, password) VALUES (?, ?, ?)', [
			Name,
			mail,
			encryptedPassword,
		]);

		res.redirect('/signin');
	} else {
		req.flash('error_msg', 'El codigo ingresado es incorrecto. Ingrese el nuevo codigo enviado');
		res.redirect('/signup/emailconfirmation');
	}
});

router.get('/signin', isNotLoggedIn, (req, res) => {
	res.render('pages/login/signin', { layout: 'loginform' });
});

router.post(
	'/signin',
	passport.authenticate('local.signin', {
		successRedirect: '/',
		failureRedirect: '/signin',
	})
);

router.get(
	'/auth/google',
	isNotLoggedIn,
	passport.authenticate('google', { scope: ['email', 'profile'], prompt: 'select_account' })
);

router.get(
	'/auth/google/callback',
	passport.authenticate('google', {
		successRedirect: '/',
		failureRedirect: 'signin',
	})
);

router.get('/logOut', isLoggedIn, (req, res) => {
	req.logout((err) => {
		if (err) return next(err);
		res.redirect('/');
	});
});

module.exports = router;

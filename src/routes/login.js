const { Router } = require('express');
const passport = require('passport');
const router = Router();

const pool = require('../database');
const helper = require('../helpers/bcrypt');
const nodeMailer = require('../helpers/nodeMailer');
const { isLoggedIn, isNotLoggedIn } = require('../helpers/isLogged');
const { TodayDate } = require('../helpers/date_related');

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
	const creation_date = TodayDate();

	const realCode = req.session.confirmationCode;
	req.session.confirmationCode = null;

	if (confirmationCode == realCode) {
		let Name = name.split(' ');
		Name = Name[1] != undefined ? Name[0] + ' ' + Name[1].charAt(0) : Name[0];
		const defaultImage = 'profile-pictures/default.jpg';

		await pool.query('INSERT INTO usuario (name, mail, password, creation_date, profile_image_route) VALUES (?, ?, ?, ?, ?)', [
			Name,
			mail,
			encryptedPassword,
			creation_date,
			defaultImage,
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

router.get('/auth/google', isNotLoggedIn, passport.authenticate('google', { scope: ['email', 'profile'], prompt: 'select_account' }));

router.get(
	'/auth/google/callback',
	passport.authenticate('google', {
		successRedirect: '/',
		failureRedirect: 'signin',
	})
);

//!!! Revisar Autenticacion necesaria para cada pagina

router.get('/signup/forgot-password/', (req, res) => {
	res.render('pages/login/forgot-password', { layout: 'loginform' });
});

router.post('/signup/forgot-password/', async (req, res) => {
	const { email } = req.body;
	const user = await pool.query('SELECT id FROM usuario WHERE mail=?', [email]);
	const link = `http://localhost:3000/signup/password-recovery/${user[0].id}`;
	await nodeMailer.SendPasswordRecoveryMail(email, link);

	res.redirect('/signin');
});

router.get('/signup/password-recovery/:id', (req, res) => {
	const id = req.params.id;

	res.render('pages/login/password-recovery', { layout: 'loginform', id });
});

router.post('/signup/password-recovery/:id', async (req, res) => {
	const id = req.params.id;
	const { newPassword, repeatNewPassword } = req.body;

	if (newPassword == repeatNewPassword) {
		let encryptedPassword = await helper.encryptPassword(newPassword);
		await pool.query('UPDATE usuario SET password=? WHERE id=?', [encryptedPassword, id]);

		req.flash('success_msg', 'Contraseña actualizada exitosamente');
		res.redirect('/signin');
	} else {
		req.flash('error_msg', 'Las contraseñas ingresadas no son iguales. Ingrese la contraseña nuevamente');
		res.redirect(`/signup/password-recovery/${id}`);
	}
});

router.get('/logOut', isLoggedIn, (req, res) => {
	req.logout((err) => {
		if (err) return next(err);
		res.redirect('/');
	});
});

module.exports = router;

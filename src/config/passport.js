const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth2').Strategy;

const pool = require('../database');
const helper = require('../helpers/bcrypt');
const { google } = require('../keys');

passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
	const user = await pool.query('select id, name from usuario where id=?', [id]);
	done(null, user);
});

passport.use(
	'google',
	new GoogleStrategy(google, async function (request, accessToken, refreshToken, profile, done) {
		const userFound = await pool.query('select * from usuario where mail=?', [profile.email]);

		if (userFound.length > 0) {
			const user = {
				id: userFound[0].id,
				name: userFound[0].name,
			};
			done(null, user);
		} else {
			const newUser = {
				name: profile.displayName,
				mail: profile.email,
				password: await helper.encryptPassword(Math.random().toString(36)),
			};

			await pool.query('INSERT INTO usuario (name, mail, password) VALUES (?, ?, ?)', [
				newUser.name,
				newUser.mail,
				newUser.password,
			]);

			const user = await pool.query('SELECT id, name FROM usuario WHERE mail=?', [
				newUser.mail,
			]);

			done(null, user[0]);
		}
	})
);

passport.use(
	'local.signin',
	new LocalStrategy(
		{
			usernameField: 'name',
			passwordField: 'password',
			passReqToCallback: true,
		},
		async (req, name, password, done) => {
			const userFound = await pool.query('select * from usuario where mail=?', [name]);
			if (userFound.length > 0) {
				const user = userFound[0];

				if (await helper.comparePassword(password, user.password)) {
					done(null, user);
				} else {
					done(null, false, req.flash('error_msg', 'Contraseña Incorrecta'));
				}
			} else {
				done(null, false, req.flash('error_msg', 'No se encontró el usuario'));
			}
		}
	)
);

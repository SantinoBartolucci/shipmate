const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth2').Strategy;

const path = require('path');
const fs = require('fs');
const axios = require('axios');

const pool = require('../database');
const helper = require('../helpers/bcrypt');
const { google } = require('../keys');
const { TodayDate } = require('../helpers/date_related');

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
			let Name = profile.displayName.split(' ');
			Name = (Name[1] != undefined ) ? Name[0] + " " + Name[1].charAt(0) : Name[0];
			const newUser = {
				name: Name,
				mail: profile.email,
				password: await helper.encryptPassword(Math.random().toString(36)),
				creation_date: TodayDate(),
			};

			await pool.query(
				'INSERT INTO usuario (name, mail, password, creation_date) VALUES (?, ?, ?, ?)',
				[newUser.name, newUser.mail, newUser.password, newUser.creation_date]
			);

			const user = await pool.query('SELECT id, name FROM usuario WHERE mail=?', [newUser.mail]);

			try {
				const imageResponse = await axios.get(profile.photos[0].value, {
					responseType: 'arraybuffer', // Especificar el tipo de respuesta como buffer
				});
				const imageBuffer = Buffer.from(imageResponse.data, 'binary');
				const imagePath = `profile-pictures/${user[0].id}.jpg`;
				fs.writeFileSync(path.join(__dirname, `../public/img/${imagePath}`), imageBuffer);

				await pool.query('UPDATE usuario SET profile_image_route=? WHERE id=?', [
					imagePath,
					user[0].id,
				]);

				console.log('Imagen guardada exitosamente en el servidor');
			} catch (e) {
				console.error('Error al guardar la imagen en el servidor', e);

				const defaultImage = 'profile-pictures/default.jpg';
				await pool.query('UPDATE usuario SET profile_image_route=? WHERE id=?', [
					defaultImage,
					user[0].id,
				]);
			}

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

const { Router } = require('express');
const router = Router();

const { isLoggedIn } = require('../helpers/isLogged');
const pool = require('../database');

router.get('/viajar', isLoggedIn, (req, res) => {
	const user = req.user[0];

	res.render('pages/viajes/viajar', { user });
});

router.post('/viajar', isLoggedIn, async (req, res) => {
	const user = req.user[0];
	const { place_from, place_to, date_start, date_end } = req.body;

	await pool.query(
		'INSERT INTO viajes (place_from, place_to, date_start, date_end) VALUES (?, ?, ?, ?)',
		[place_from, place_to, date_start, date_end]
	);

	req.flash('success_msg', '¡Viaje registrado correctamente!');
	res.redirect('/viajar');
});

module.exports = router;

const { Router } = require('express');
const router = Router();

const { isLoggedIn } = require('../helpers/isLogged');
const pool = require('../database');
const { IsSqlInjectionAttempt } = require('../helpers/isSQL');

router.get('/viajar', isLoggedIn, (req, res) => {
	const user = req.user[0];

	res.render('pages/viajes/viajar', { user });
});

router.post('/viajar', isLoggedIn, async (req, res) => {
	const { place_from, place_to, date_start, date_end } = req.body;

	if (IsSqlInjectionAttempt(place_from) || IsSqlInjectionAttempt(place_to)) {
		res.redirect("/viajar");
	} else {
		const response = await pool.query(
			'INSERT INTO viajes (place_from, place_to, date_start, date_end) VALUES (?, ?, ?, ?)',
			[place_from, place_to, date_start, date_end]
		);
		await pool.query('INSERT INTO viajando (travel_id, user_id) VALUES (?, ?)', [
			response.insertId,
			req.user[0].id,
		]);
		
		req.flash('success_msg', '¡Viaje registrado correctamente!');
		res.redirect('/mytripsandproducts');
	}
});

module.exports = router;

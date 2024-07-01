const { Router } = require('express');
const router = Router();

const { isLoggedIn } = require('../helpers/isLogged');

router.get('/viajar', isLoggedIn, (req, res) => {
	const user = req.user[0];

	res.render('pages/viajes/viajar', { user });
});

router.post('/viajar', isLoggedIn, (req, res) => {
	const user = req.user[0];
	const { box, place_from, place_to, date_start, date_end } = req.body;

	console.log(box);
	console.log(place_from);
	console.log(place_to);
	console.log(date_start);
	console.log(date_end);

	res.render('pages/viajes/viajar', { user });
});

module.exports = router;

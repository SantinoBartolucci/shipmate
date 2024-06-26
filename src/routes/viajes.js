const { Router } = require('express');
const router = Router();

const { isLoggedIn } = require('../helpers/isLogged');

router.get('/viajar', isLoggedIn, (req, res) => {
	const user = req.user[0];

	res.render('pages/viajes/viajar', { user });
});

module.exports = router;

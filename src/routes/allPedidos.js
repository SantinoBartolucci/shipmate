const { Router } = require('express');
const router = Router();

const { isLoggedIn } = require('../helpers/isLogged');

router.get('/allPedidos', isLoggedIn, (req, res) => {
	const user = req.user[0];

	res.render('pages/ofertado/allPedidos', { user });
});

module.exports = router;

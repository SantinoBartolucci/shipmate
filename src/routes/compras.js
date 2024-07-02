const { Router } = require('express');
const router = Router();

const { isLoggedIn } = require('../helpers/isLogged');

router.get('/comprar', isLoggedIn, (req, res) => {
	const user = req.user[0];

	res.render('pages/compras/comprar-detalles', { user });
});

router.get('/comprar-confirmar', isLoggedIn, (req, res) => {
	const user = req.user[0];

	res.render('pages/compras/comprar-confirmar', { user });
});

module.exports = router;

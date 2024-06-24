const { Router } = require('express');
const router = Router();

const { isLoggedIn } = require('../helpers/isLogged');

router.get('/comprar', isLoggedIn, (req, res) => {
	const user = req.user[0];

	res.render('pages/compras/comprar', { user });
});

module.exports = router;

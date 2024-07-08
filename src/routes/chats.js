const { Router } = require('express');
const router = Router();

const { isLoggedIn } = require('../helpers/isLogged');

router.get('/chats/:id', isLoggedIn, (req, res) => {
	const user = req.user[0];
	res.render('pages/chats/index', { layout: 'chats', user }); // { user });
});

module.exports = router;

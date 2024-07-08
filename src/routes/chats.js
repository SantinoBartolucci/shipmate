const { Router } = require('express');
const router = Router();

router.get('/chats/:id', (req, res) => {
	const user = req.user[0];
	res.render('pages/chats/index', { layout: 'chats', user }); // { user });
});

module.exports = router;

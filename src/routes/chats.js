const { Router } = require('express');
const router = Router();

router.get('/chats/:id', (req, res) => {
    const user = req.user[0];
	const id = req.params.id;

	res.render('pages/chats/index', { user });
});

module.exports = router;

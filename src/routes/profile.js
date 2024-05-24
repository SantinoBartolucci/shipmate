const { Router } = require('express');
const router = Router();

router.get('/profile', (req, res) => {
	const name = req.user[0].name
	res.render('pages/profile/index', { name });
});

module.exports = router;

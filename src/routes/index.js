const { Router } = require('express');
const router = Router();

router.get('/', (req, res) => {
	let user = null;
	if (req.user)
		user = req.user[0];
	res.render('index', user);
});

module.exports = router;

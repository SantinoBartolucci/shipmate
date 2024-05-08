const { Router } = require('express');
const router = Router();

router.get('/', (req, res) => {
	let name = null;
	if (req.user)
		name = req.user[0].name
	res.render('index', { name });
});

module.exports = router;

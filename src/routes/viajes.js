const { Router } = require('express');
const router = Router();

router.get('/viajar', (req, res) => {
	const user = req.user[0];

	res.render('pages/viajes/viajar', { user });
});

module.exports = router;

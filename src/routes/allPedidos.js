const { Router } = require('express');
const router = Router();

const { isLoggedIn } = require('../helpers/isLogged');
const pool = require('../database');

router.get('/allPedidos', isLoggedIn, async (req, res) => {
	const user = req.user[0];

	const pedidos = await pool.query("SELECT * FROM pedidos WHERE enabled=1 AND NOT user_id=?", [user.id]);
	
	for(let e of pedidos) {
		e.hostname = getDomainName(e.link);
		e.username = await pool.query("SELECT name FROM usuario WHERE id=?", [e.user_id]);
		e.username = e.username[0].name
		e.with_box = (e.with_box == true) ? "Con Caja" : "Sin Caja";
	};

	res.render('pages/ofertado/allPedidos', { user, pedidos });
});

function getDomainName(url) {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname; // Obtiene el hostname

    // Divide el hostname en partes y toma el segundo elemento
    const parts = hostname.split('.');
    return parts[1]
}

module.exports = router;

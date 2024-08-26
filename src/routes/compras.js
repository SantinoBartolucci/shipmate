const { Router } = require('express');
const router = Router();

const { isLoggedIn } = require('../helpers/isLogged');
const pool = require('../database');

router.get('/comprar', isLoggedIn, (req, res) => {
	const user = req.user[0];

	res.render('pages/compras/comprar-detalles', { user });
});

router.post('/comprar', async (req, res) => {
	let { link, name, price, amount, details, from, to, box } = req.body;

	const with_box = box == 'no' ? false : true;
	price *= amount;
	let viajero = price * 0.25;
	viajero = Number.parseFloat(viajero).toFixed(2);
	let service = price * 0.1;
	service = Number.parseFloat(service).toFixed(2);
	let total = Number(price) + Number(viajero) + Number(service);
	total = Number.parseFloat(total).toFixed(2);
	total = Number(total);

	const result = await pool.query(
		'INSERT INTO pedidos (link, name, price, viajero, service, total, amount, details, from_place, to_place, with_box, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
		[
			link,
			name,
			price,
			viajero,
			service,
			total,
			amount,
			details,
			from,
			to,
			with_box,
			req.user[0].id,
		]
	);

	req.session.pedidoId = result.insertId;

	res.redirect('/comprar-confirmar');
});

router.get('/comprar-confirmar', isLoggedIn, async (req, res) => {
	const user = req.user[0];

	const id = req.session.pedidoId;

	const data = await pool.query('SELECT * from pedidos WHERE id=?', [id]);

	const product = {
		link: data[0].link,
		name: data[0].name,
		price: data[0].price,
		amount: data[0].amount,
		details: data[0].details,
		from: data[0].from_place,
		to: data[0].to_place,
		box: data[0].with_box == true ? 'Si' : 'No',
		viajero: data[0].viajero,
		service: data[0].service,
		total: data[0].total,
	};

	res.render('pages/compras/comprar-confirmar', { user, product });
});

router.post('/comprar-confirmar', async (req, res) => {
	const id = req.session.pedidoId;
	req.session.pedidoId = null;

	pool.query('UPDATE pedidos SET enabled=? WHERE id=?', [true, id]);

	req.flash('success_msg', 'Pedido registrado correctamente!');
	res.redirect('/');
});

module.exports = router;

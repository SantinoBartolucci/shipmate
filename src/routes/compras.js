const { Router } = require('express');
const router = Router();

const pool = require('../database');
const { isLoggedIn } = require('../helpers/isLogged');
const { IsSqlInjectionAttempt } = require('../helpers/isSQL');
const { TodayDate } = require('../helpers/date_related');
const nodeMailer = require('../helpers/nodeMailer');

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

	if (IsSqlInjectionAttempt(link) || IsSqlInjectionAttempt(name) || IsSqlInjectionAttempt(details) || IsSqlInjectionAttempt(from) || IsSqlInjectionAttempt(to)) {
		res.redirect("/comprar")
	} else {
		const product = {
			link: link,
			name: name,
			price: price,
			amount: amount,
			details: details,
			from: from,
			to: to,
			Box: with_box,
			viajero: viajero,
			service: service,
			total: total,
		};

		req.session.product = product;
		
		res.redirect('/comprar-confirmar');
	}
});

router.get('/comprar-confirmar', isLoggedIn, async (req, res) => {
	const user = req.user[0];
	const product = req.session.product;

	res.render('pages/compras/comprar-confirmar', { user, product });
});

router.post('/comprar-confirmar', async (req, res) => {
	const user = req.user[0];
	const product = req.session.product;
	req.session.product = null;
	let today = TodayDate();

	const result = await pool.query(
			'INSERT INTO pedidos (link, name, price, viajero, service, total, amount, details, from_place, to_place, with_box, enabled, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
			[product.link, product.name, product.price, product.viajero, product.service, product.total, product.amount, product.details, product.from, product.to, product.Box, 1, req.user[0].id]
		);
	await pool.query("CALL IngresarEstadoPedido(?, ?, ?)", [result.insertId, "publicado", today]);
	
	nodeMailer.NotifyAllTravelers(product.from, product.to, result.insertId, user.id);

	req.flash('success_msg', 'Pedido registrado correctamente!');
	res.redirect('/mytripsandproducts');
});

module.exports = router;

const { Router } = require('express');
const router = Router();

const { isLoggedIn } = require('../helpers/isLogged');
const pool = require('../database');
const { IsSqlInjectionAttempt } = require('../helpers/isSQL');

const { MercadoPagoConfig, Preference, Payment } = require("mercadopago");
const meli = new MercadoPagoConfig({accessToken: "APP_USR-7396164588534070-101413-216e559d39556bf72373d044a102fc31-2035049805"});

router.get('/productoenoferta/:id', isLoggedIn, async (req, res) => {
	const user = req.user[0];
	const product_id = parseInt(req.params.id);
	let product = await GetProduct(product_id);
	let offers = await GetOffers(product_id, user.id);

	let owner = product.user_id == user.id ? true : false;

	let [enabled] = await pool.query('select enabled from pedidos where id = ?', [
		product_id,
	]);

    if (enabled.enabled == 0) res.redirect('/chats/' + user.id);
	res.render('pages/ofertado/index', { user, owner, product, offers });
});

router.post("/productoenoferta/:id/ofertar", isLoggedIn, async (req, res) => {
    const user = req.user[0];
    const product_id = parseInt(req.params.id);
    const { comision } = req.body;

    let product = await pool.query("SELECT viajero, total FROM pedidos WHERE id=?", [product_id]);
    let ofertaTotal = product[0].total - product[0].viajero + parseInt(comision);

    if (IsSqlInjectionAttempt(product) || IsSqlInjectionAttempt(ofertaTotal))
        res.redirect("/");

    await pool.query('INSERT INTO `ofertas`(`id_usuario`, `id_pedido`, `total`) VALUES (?, ?, ?)', [user.id, product_id, ofertaTotal]);
    
    res.redirect("/productoenoferta/" + product_id);
});

router.post('/productoenoferta/:id/ofertar', isLoggedIn, async (req, res) => {
	const user = req.user[0];
	const product_id = parseInt(req.params.id);
	const { comision } = req.body;

	let product = await pool.query(
		'SELECT viajero, total FROM pedidos WHERE id=?',
		[product_id]
	);
	let ofertaTotal = product[0].total - product[0].viajero + parseInt(comision);

	await pool.query(
		'INSERT INTO `ofertas`(`id_usuario`, `id_pedido`, `total`) VALUES (?, ?, ?)',
		[user.id, product_id, ofertaTotal]
	);

	res.redirect('/productoenoferta/' + product_id);
});

router.get('/deleteOffer/:productid/:id', isLoggedIn, async (req, res) => {
	const offer_id = parseInt(req.params.id);
	const product_id = parseInt(req.params.productid);

	await pool.query('DELETE FROM ofertas WHERE id=?', [offer_id]);
	res.redirect('/productoenoferta/' + product_id);
});

router.get('/acceptOffer/:id', isLoggedIn, async (req, res) => {
	const offer_id = parseInt(req.params.id);
	// console.log(offer_id + " 1");

	const [offersInfo] = await pool.query(
		'SELECT id_pedido, id_usuario, total FROM ofertas where id = ? ',
		[offer_id]
	);

	const [product] = await pool.query(
		'select name, total, amount from pedidos where id = (?) ',
		[offersInfo.id_pedido]
	);

	product.total = offersInfo.total;

	let url = await CreateOrder(product, offer_id);
	// console.log(url);
	res.redirect(url);
});

router.get('/payment/success/:offerId', isLoggedIn, async (req, res) => {
	const offer_id = parseInt(req.params.offerId);
	// console.log(offer_id);

	const [offersInfo] = await pool.query(
		'SELECT id_pedido, id_usuario FROM ofertas where id = ? ',
		[offer_id]
	);

	await pool.query('DELETE FROM ofertas WHERE id != ? and id_usuario = ?', [
		offer_id,
		offersInfo.id_usuario,
	]);

	// console.log(offersInfo);
	await pool.query('UPDATE pedidos SET enabled = 0 WHERE id = ?', [
		offersInfo.id_pedido,
	]);

	const [productInfo] = await pool.query(
		'select name, user_id from pedidos where id = (?) ',
		[offersInfo.id_pedido]
	);
	// console.log(productInfo);
	let response = await pool.query('INSERT INTO chats (name) VALUES (?)', [
		productInfo.name,
	]);
	const chatId = response.insertId;

	response = await pool.query(
		'INSERT INTO chat_members (chat_id, user_id) VALUES (?, ?)',
		[chatId, productInfo.user_id]
	);

	response = await pool.query(
		'INSERT INTO chat_members (chat_id, user_id) VALUES (?, ?)',
		[chatId, offersInfo.id_usuario]
	);

	res.redirect('/chats/' + productInfo.user_id);
});

router.get('/payment/failure', isLoggedIn, (req, res) => {
    res.send('Payment failed. Please try again.');
});

router.get('/payment/pending', isLoggedIn, (req, res) => {
    res.send('Payment is pending. Please check back later.');
});

async function GetProduct(id) {
	const product = await pool.query(
		'SELECT id, user_id, name, total, from_place, to_place, details FROM pedidos WHERE id=?',
		[id]
	);

	return product[0];
}

async function GetOffers(pedidoId, userId) {
	const offers = await pool.query('SELECT * FROM ofertas WHERE id_pedido=?', [
		pedidoId,
	]);

	let results = [];

	for (e of offers) {
		username = await pool.query('SELECT name FROM usuario WHERE id=?', [
			e.id_usuario,
		]);

		let ans = {
			id: e.id,
			id_usuario: e.id_usuario,
			username: username[0].name,
			id_pedido: e.id_pedido,
			total: e.total,
		};

		ans.user_owner = ans.id_usuario == userId ? true : false;
		results.push(ans);
	}

	return results;
}

async function CreateOrder(product, offer_id) {
	const result = await new Preference(meli).create({
        body: {
            items: [
                {
                    title: product.name,
                    unit_price: product.total,
                    currency_id: "ARG",
                    quantity: product.amount,
                }
            ],
            back_urls: {
                success: `http://localhost:3000/payment/success/${offer_id}`,
                failure: `http://localhost:3000/payment/failure`,
                pending: `http://localhost:3000/payment/pending`
            },
            auto_return: 'approved',
        }
    });
    
	return result.init_point;
}

module.exports = router;

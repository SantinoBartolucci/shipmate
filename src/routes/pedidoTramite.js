const { Router } = require('express');
const router = Router();

const { isLoggedIn } = require('../helpers/isLogged');
const pool = require('../database');

router.get('/productoenoferta/:id', isLoggedIn,  async (req, res) => {
    const user = req.user[0];
    const product_id = parseInt(req.params.id);
    let product = await GetProduct(product_id);
    let offers = await GetOffers(product_id, user.id);

    let owner = (product.user_id == user.id) ? true : false;

    res.render('pages/ofertado/index', { user, owner, product, offers });
})

router.post("/productoenoferta/:id/ofertar", isLoggedIn, async (req, res) => {
    const user = req.user[0];
    const product_id = parseInt(req.params.id);
    const { comision } = req.body;

    let product = await pool.query("SELECT viajero, total FROM pedidos WHERE id=?", [product_id]);
    let ofertaTotal = product.total - product.viajero + comision;

    await pool.query("INSERT INTO `ofertas`(`id_usuario`, `id_pedido`, `total`) VALUES (?, ?, ?)", [user.id, product_id, ofertaTotal]);
    
    res.redirect("/productoenoferta/" + product_id);
});

router.get("/deleteOffer/:id", isLoggedIn, async (req, res) => {
    const offer_id = parseInt(req.params.id);

    await pool.query("DELETE FROM ofertas WHERE id=?", [offer_id]);
    res.redirect("/productoenoferta/" + product_id);
});

async function GetProduct(id) {
    const product = await pool.query("SELECT user_id, name, total, from_place, to_place, details FROM pedidos WHERE id=?", [id]); 

    return product[0];
}

async function GetOffers(pedidoId, userId) {
    const offers = await pool.query("SELECT * FROM ofertas WHERE id_pedido=?", [pedidoId]);

    let results = [];

    offers.forEach(e => {
        let ans = {
            id: e.id,
            id_usuario: e.id_usuario,
            id_pedido: e.id_pedido,
            total: e.total,
        }

        ans.user_owner = (ans.id_usuario == userId) ? true : false;
        results.push(ans);
    });

    return results
}

module.exports = router;
const { Router } = require('express');
const router = Router();

const { isLoggedIn } = require('../helpers/isLogged');
const pool = require('../database');

router.get('/productoenoferta', (req, res) => {
    //const user = req.user[0];
    res.render('pages/ofertado/index');//, { user });
})

module.exports = router;
const express = require('express');
const router = express.Router();
const CartManager = require('../CartManager'); 

const cartManager = new CartManager('carts.json');

router.post('/', async (req, res) => {
    const cart = await cartManager.createCart();
    res.json(cart);
});


router.get('/:cid', async (req, res) => {
    const cartId = parseInt(req.params.cid);
    const cart = await cartManager.getCartById(cartId);
    res.json(cart);
});

router.post('/:cid/product/:pid', async (req, res) => {
    const cartId = parseInt(req.params.cid);
    const productId = parseInt(req.params.pid);
    const { quantity } = req.body;

    const result = await cartManager.addToCart(cartId, productId, quantity);
    res.json(result);
});

module.exports = router;


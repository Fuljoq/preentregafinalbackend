const express = require('express');
const router = express.Router();
const ProductModel = require('./models/ProductModel');

// Ruta para renderizar la vista
router.get('/', async (req, res) => {
    try {
        const products = await ProductModel.find();
        res.render('realtimeproducts', { products });
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).send('Error al cargar los productos');
    }
});

module.exports = router;
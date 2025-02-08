const express = require('express');
const ProductModel = require('./models/ProductModel');
const fs = require('fs').promises;

const router = express.Router();
const PRODUCTS_FILE = './data/products.json';

async function getProducts() {
  try {
    const data = await fs.readFile(PRODUCTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveProducts(products) {
  await fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2));
}

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'asc', query } = req.query;

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { price: sort === 'asc' ? 1 : -1 },
    };

    const filter = query
      ? {
          $or: [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
          ],
        }
      : {};

    const result = await ProductModel.paginate(filter, options);

    res.json({
      status: 'success',
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const products = await getProducts();
  const product = products.find(p => p.id === id);
  if (!product) {
    return res.status(404).send('Producto no encontrado');
  }
  res.render('product-details', { product });
});

router.post('/', async (req, res) => {
  const { title, description, code, price, stock, category, thumbnails } = req.body;

  if (!title || !description || !code || !price || !stock || !category) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const products = await getProducts();
  const newProduct = {
    id: `prod-${Date.now()}`,
    title,
    description,
    code,
    price,
    stock,
    category,
    thumbnails: thumbnails || [],
    status: true,
  };

  products.push(newProduct);
  await saveProducts(products);

  res.status(201).json(newProduct);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  let products = await getProducts();
  const productIndex = products.findIndex(p => p.id === id);

  if (productIndex === -1) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  const deletedProduct = products.splice(productIndex, 1)[0];
  await saveProducts(products);

  res.status(200).json(deletedProduct);
});

module.exports = router;
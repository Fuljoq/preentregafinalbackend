import express from 'express';
import fs from 'fs/promises';

const router = express.Router();
const CARTS_FILE = './data/carts.json';
const PRODUCTS_FILE = './data/products.json';

async function getCarts() {
  try {
    const data = await fs.readFile(CARTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveCarts(carts) {
  await fs.writeFile(CARTS_FILE, JSON.stringify(carts, null, 2));
}

async function getProducts() {
  try {
    const data = await fs.readFile(PRODUCTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

router.put('/:cid', async (req, res) => {
  const { cid } = req.params;
  const { products } = req.body;

  if (!Array.isArray(products)) {
    return res.status(400).json({ error: 'El formato de productos es inválido' });
  }

  const carts = await getCarts();
  let cart = carts.find(c => c.id === cid);

  if (!cart) {
    return res.status(404).json({ error: 'Carrito no encontrado' });
  }

  cart.products = products;
  await saveCarts(carts);

  res.status(200).json(cart);
});

router.delete('/:cid/products/:pid', async (req, res) => {
  const { cid, pid } = req.params;

  const carts = await getCarts();
  const cart = carts.find(c => c.id === cid);

  if (!cart) {
    return res.status(404).json({ error: 'Carrito no encontrado' });
  }

  const productIndex = cart.products.findIndex(p => p.id === pid);

  if (productIndex === -1) {
    return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
  }

  cart.products.splice(productIndex, 1);
  await saveCarts(carts);

  res.status(200).json(cart);
});

export default router;
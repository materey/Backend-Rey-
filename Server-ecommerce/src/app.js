const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 8080;


app.use(express.json());


const productsPath = './data/products.json';
const cartsPath = './data/carts.json';

const readFile = (path) => {
    return JSON.parse(fs.readFileSync(path, 'utf-8'));
};

const writeFile = (path, data) => {
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
};




app.get('/api/products', (req, res) => {
    const products = readFile(productsPath);
    const limit = req.query.limit ? parseInt(req.query.limit) : products.length;
    res.json(products.slice(0, limit));
});


app.get('/api/products/:pid', (req, res) => {
    const products = readFile(productsPath);
    const product = products.find(p => p.id === req.params.pid);
    if (!product) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(product);
});


app.post('/api/products', (req, res) => {
    const products = readFile(productsPath);
    const newProduct = {
        id: (products.length + 1).toString(), 
        title: req.body.title,
        description: req.body.description,
        code: req.body.code,
        price: req.body.price,
        status: req.body.status !== undefined ? req.body.status : true,
        stock: req.body.stock,
        category: req.body.category
    };
    products.push(newProduct);
    writeFile(productsPath, products);
    res.status(201).json(newProduct);
});


app.put('/api/products/:pid', (req, res) => {
    const products = readFile(productsPath);
    const index = products.findIndex(p => p.id === req.params.pid);
    if (index === -1) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const updatedProduct = { ...products[index], ...req.body };
    delete updatedProduct.id; 
    products[index] = updatedProduct;
    writeFile(productsPath, products);
    res.json(updatedProduct);
});


app.delete('/api/products/:pid', (req, res) => {
    const products = readFile(productsPath);
    const newProducts = products.filter(p => p.id !== req.params.pid);
    if (products.length === newProducts.length) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }
    writeFile(productsPath, newProducts);
    res.status(204).send();
});




app.post('/api/carts', (req, res) => {
    const carts = readFile(cartsPath);
    const newCart = {
        id: (carts.length + 1).toString(), 
        products: []
    };
    carts.push(newCart);
    writeFile(cartsPath, carts);
    res.status(201).json(newCart);
});


app.get('/api/carts/:cid', (req, res) => {
    const carts = readFile(cartsPath);
    const cart = carts.find(c => c.id === req.params.cid);
    if (!cart) {
        return res.status(404).json({ error: 'Carrito no encontrado' });
    }
    res.json(cart.products);
});


app.post('/api/carts/:cid/product/:pid', (req, res) => {
    const carts = readFile(cartsPath);
    const cart = carts.find(c => c.id === req.params.cid);
    if (!cart) {
        return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    const products = readFile(productsPath);
    const productExists = products.find(p => p.id === req.params.pid);
    if (!productExists) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const productInCart = cart.products.find(p => p.product === req.params.pid);
    if (productInCart) {
        productInCart.quantity += 1;
    } else {
        cart.products.push({ product: req.params.pid, quantity: 1 });
    }

    writeFile(cartsPath, carts);
    res.json(cart);
});


app.listen(PORT, () => {
    console.log(`Servidor escuchando en localhost:${PORT}`);
});

const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const port = 8080;


app.engine('handlebars', require('express-handlebars')());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(express.static(path.join(__dirname, 'public')));

const productsPath = './data/products.json';
const readFile = (path) => JSON.parse(fs.readFileSync(path, 'utf-8'));
const writeFile = (path, data) => fs.writeFileSync(path, JSON.stringify(data, null, 2));


app.get('/home', (req, res) => {
    const products = readFile(productsPath);
    res.render('home', { products });
});

app.get('/realtimeproducts', (req, res) => {
    const products = readFile(productsPath);
    res.render('realTimeProducts', { products });
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


    io.emit('productUpdated', products);

    res.status(201).json(newProduct);
});

app.delete('/api/products/:pid', (req, res) => {
    const products = readFile(productsPath);
    const newProducts = products.filter(p => p.id !== req.params.pid);
    if (products.length === newProducts.length) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }
    writeFile(productsPath, newProducts);


    io.emit('productUpdated', newProducts);

    res.status(204).send();
});


io.on('connection', (socket) => {
    console.log('Cliente conectado');
    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});


httpServer.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});

const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const path = require('path');
const { engine } = require('express-handlebars');
const mongoose = require('mongoose');
const productsRouter = require('./routes/products');
const cartsRouter = require('./routes/carts');
const realtimeProductsRouter = require('./routes/realtimeproducts');

const dbURI = 'mongodb+srv://joaquinorlandaurosso:kLRiSoDLFoh3I4L2@cluster0.bgjej.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.engine('handlebars', engine({ 
    extname: '.handlebars', 
    defaultLayout: 'main', 
    layoutsDir: path.join(__dirname, 'views', 'layout') 
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Ruta raíz
app.get('/', (req, res) => {
    res.render('home');
});

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/realtimeproducts', realtimeProductsRouter);

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

    socket.emit('mensaje', 'Conexión establecida con el servidor');

    socket.on('actualizarProductos', (productos) => {
        console.log('Lista de productos recibida:', productos);
        io.emit('productosActualizados', productos);
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});

const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
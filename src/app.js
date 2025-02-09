const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const path = require('path');
const { engine } = require('express-handlebars');
const mongoose = require('mongoose');
const productsRouter = require('./routes/products');
const cartsRouter = require('./routes/carts');
const realtimeProductsRouter = require('./routes/realtimeproducts');

const uri = "mongodb+srv://coderhouse:codercoder2023@cluster0.wpxpupc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
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


app.get('/', (req, res) => {
    res.render('home');
});

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/realtimeproducts', realtimeProductsRouter);


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





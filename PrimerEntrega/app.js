const express = require("express");
const app = express();
const exphbs = require("express-handlebars");
const socket = require("socket.io");
const PUERTO = 8080;


const productsRouter = require("./routes/products.router.js");
const cartsRouter = require("./routes/carts.router.js");
const viewsRouter = require("./routes/views.router.js");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("./src/public"));

app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");

app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/", viewsRouter);

const server = app.listen(PUERTO, () => {
    console.log(`Servidor escuchando en el puerto ${PUERTO}`);
});



const ProductManager = require("./controllers/product-manager.js");
const productManager = new ProductManager("./src/models/productos.json");


const io = socket(server);

io.on("connection", async (socket) => {
    console.log("Nuevo cliente conectado");

    socket.emit("productos", await productManager.getProducts());    
    
  
    socket.on("eliminarProducto", async (id) => {
        await productManager.deleteProduct(id);
       
        io.sockets.emit("productos", await productManager.getProducts());
    });

    socket.on("agregarProducto", async (producto) => {
        await productManager.addProduct(producto);
        
        io.sockets.emit("productos", await productManager.getProducts());
    });
});
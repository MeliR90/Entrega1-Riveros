const fs = require('fs').promises;

class ProductManager {

    constructor(path) {
        this.path = path;
        this.products = this.loadProducts() || [];
        this.nextProductId = 1;
    }

    async init() {
        await this.loadProducts();
    }

    async getProducts() {
        
        if (!this.products || this.products.length === 0) {
            await this.loadProducts();
        }
        return this.products;
    }

    async loadProducts() {
        try {
            if (await fs.stat(this.path)) {
                const data = await fs.readFile(this.path, 'utf8');
                console.log("Data del JSON:", data);
                this.products = JSON.parse(data);
                this.nextProductId = this.products.length > 0 ? Math.max(...this.products.map(p => p.id)) + 1 : 1;
            }
        } catch (err) {
            if (err.code === 'ENOENT') {
                console.log("El archivo no existe");
                this.products = [];
            } else {
                throw err;
            }
        }
    }

    async saveProducts() {
        try {
            await fs.writeFile(this.path, JSON.stringify(this.products, null, 2), 'utf8');
        } catch (err) {
            console.error("Error al guardar los productos:", err);
        }
    }


    async addProduct({ title, description, code, price, stock, category, thumbnails = [], status = true }) {

        
        if (!title || !description || !code || !category) {
            console.log("Error: Complete todos los campos");
            console.log(title, description, code, category)
            return {status: 400, msg:"Error: complete todos los campos"};
        }

        if (typeof price !== 'number' || typeof stock !== 'number') {
            console.log("Error: Precio y stock deben ser números.");
            return  {status: 400, msg:"Error: Precio y stock deben ser números."};
        }

        if (this.products.some(product => product.code === code)) {
            console.log("Error: El código ya existe.");
            return{status: 400, msg:"Error: El código ya existe."};
        }

        const product = {
            id: this.nextProductId++,
            title,
            description,
            price: Number(price),
            thumbnails,
            code,
            stock: Number(stock),
            status,
            category
        }

        this.products.push(product);
        await this.saveProducts();
        console.log(`El producto ${title} ha sido agregado con éxito.`);
        return{status: 200, msg:`El producto ${title} ha sido agregado con éxito.`};
    }


    async getProductById(id) {
        const product = this.products.find(product => product.id === id);
        if (product) {
            return product;
        } else {
            return { error: 'Producto no encontrado' };
        }
    }

    async updateProduct(id, updatedProduct) {
        const productIndex = this.products.findIndex(product => product.id === id);
        if (productIndex !== -1) {
            this.products[productIndex] = { ...this.products[productIndex], ...updatedProduct, id: id };
            await this.saveProducts();
            console.log(`El producto con id ${id} ha sido actualizado con éxito.`);
        } else {
            console.log("Error: Producto no encontrado.");
        }
    }

    async deleteProduct(id) {
        const productIndex = this.products.findIndex(product => product.id === id);
        if (productIndex !== -1) {
            this.products.splice(productIndex, 1);
            await this.saveProducts();
            console.log(`El producto con id ${id} ha sido eliminado con éxito.`);
        } else {
            console.log("Error: Producto no encontrado.");
        }
    }
}

module.exports = ProductManager;



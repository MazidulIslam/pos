class ProductController {
    async getProducts(req, res) {
        res.status(200).json({ success: true, message: "Product module scaffolding active" });
    }
}

module.exports = new ProductController();

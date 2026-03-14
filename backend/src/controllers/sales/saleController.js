class SaleController {
    async getSales(req, res) {
        res.status(200).json({ success: true, message: "Sales module scaffolding active" });
    }
}

module.exports = new SaleController();

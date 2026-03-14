class CustomerController {
    async getCustomers(req, res) {
        res.status(200).json({ success: true, message: "Customer module scaffolding active" });
    }
}

module.exports = new CustomerController();

const router = require('express').Router();
const Order = require('../models/Order');

router.post('/', async (req, res) => {
  const order = await Order.create(req.body);
  res.json(order);
});

router.get('/my/:userId', async (req, res) => {
  const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
  res.json(orders);
});

router.get('/admin/all', async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});

router.put('/admin/status/:id', async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );

  res.json(order);
});

module.exports = router;
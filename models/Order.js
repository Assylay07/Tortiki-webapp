const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: String,
  customer: Object,
  items: Array,
  total: Number,
  payment: String,
  delivery: String,
  address: String,
  comment: String,
  orderDate: String,
  orderTime: String,
  subtotal: Number,
  deliveryFee: Number,
  orderDate: String,
  orderTime: String,
  status: { type: String, default: 'Новый' }
});

module.exports = mongoose.models.Order || mongoose.model('Order', OrderSchema);
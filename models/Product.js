const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: String,
  category: String,
  description: String,
  composition: String,
  price: Number,
  image: String,
  sizes: Array,
  isBestSeller: Boolean
});

module.exports = mongoose.models.Product || mongoose.model('Product', ProductSchema);
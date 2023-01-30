const mongoose = require("mongoose");
const moment=require('moment')
const reviewSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "products",
  },
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "userData",
  },
  title: {
    type: String,
  },
  review: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
  },
  date: {
    type: String,
    default: moment(Date.now()).format("DD-MM-YYYY"),
  },
});

module.exports = reviewModel = mongoose.model("reviews", reviewSchema);

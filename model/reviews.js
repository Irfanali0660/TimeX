const mongoose = require("mongoose");

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

module.exports = reviewSchema = mongoose.model("reviews", reviewSchema);

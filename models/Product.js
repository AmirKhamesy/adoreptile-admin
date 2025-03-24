import mongoose, { model, Schema, models } from "mongoose";

const DiscountSchema = new Schema({
  quantity: { type: Number, required: true },
  type: { type: String, enum: ["fixed", "percentage"], required: true },
  value: { type: Number, required: true },
});

const ProductSchema = new Schema(
  {
    title: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    images: [{ type: String }],
    category: { type: mongoose.Types.ObjectId, ref: "Category" },
    properties: { type: Object },
    discounts: [DiscountSchema],
    weight: { type: Number, min: 0 }, // weight in lbs
    dimensions: {
      length: { type: Number, min: 0 }, // length in cm
      width: { type: Number, min: 0 }, // width in cm
      height: { type: Number, min: 0 }, // height in cm
    },
  },
  {
    timestamps: true,
  }
);

export const Product = models.Product || model("Product", ProductSchema);

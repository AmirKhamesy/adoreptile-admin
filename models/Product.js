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
    weight: { type: Number }, // Weight in grams
    dimensions: {
      length: { type: Number }, // Length in centimeters
      width: { type: Number }, // Width in centimeters
      height: { type: Number }, // Height in centimeters
    },
    requiresSpecialShipping: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const Product = models.Product || model("Product", ProductSchema);

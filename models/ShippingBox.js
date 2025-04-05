import mongoose, { model, Schema, models } from "mongoose";

const ShippingBoxSchema = new Schema(
  {
    name: { type: String, required: true },
    description: String,
    dimensions: {
      length: { type: Number, required: true, min: 0 },
      width: { type: Number, required: true, min: 0 },
      height: { type: Number, required: true, min: 0 },
    },
    maxWeight: { type: Number, required: true, min: 0 },
    isDefault: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const ShippingBox =
  models?.ShippingBox || model("ShippingBox", ShippingBoxSchema);

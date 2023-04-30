import mongoose, { model, Schema, models } from "mongoose";

const CategorySchema = new Schema({
  name: { type: String, required: true },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: "Category",
  },
});

export const Category = models?.Category || model("Category", CategorySchema);

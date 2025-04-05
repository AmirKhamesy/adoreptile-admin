import { mongooseConnect } from "@/lib/mongoose";
import { isAdminRequest } from "@/pages/api/auth/[...nextauth]";
import { Category } from "@/models/Category";
import { Product } from "@/models/Product";
import { Setting } from "@/models/Setting";
import path from "path";
import { promises as fs } from "fs";

export default async function handle(req, res) {
  await mongooseConnect();
  await isAdminRequest(req, res);

  if (req.method === "POST") {
    try {
      let categoriesAdded = 0;
      let productsAdded = 0;

      // Read the seed data file
      const jsonDirectory = path.join(process.cwd());
      const fileContents = await fs.readFile(
        jsonDirectory + "/seed-data.json",
        "utf8"
      );
      const seedData = JSON.parse(fileContents);

      // Create categories
      const categoryMap = new Map();
      for (const categoryData of seedData.categories) {
        let category = await Category.findOne({ name: categoryData.name });
        if (!category) {
          category = await Category.create(categoryData);
          categoriesAdded++;
        }
        categoryMap.set(categoryData.name, category._id);
      }

      // Create products
      for (const productData of seedData.products) {
        const categoryId = categoryMap.get(productData.categoryName);
        if (!categoryId) {
          console.warn(`Category not found for product: ${productData.title}`);
          continue;
        }

        const productToCreate = {
          ...productData,
          category: categoryId,
        };
        delete productToCreate.categoryName;

        const existingProduct = await Product.findOne({
          title: productData.title,
        });

        if (!existingProduct) {
          await Product.create(productToCreate);
          productsAdded++;
        } else {
          // Update existing product with new weight and dimensions
          await Product.updateOne(
            { _id: existingProduct._id },
            {
              $set: {
                weight: productToCreate.weight,
                dimensions: productToCreate.dimensions,
                images: productToCreate.images,
              },
            }
          );
        }
      }

      // Set featured product
      if (seedData.settings?.featuredProductTitle) {
        const featuredProduct = await Product.findOne({
          title: seedData.settings.featuredProductTitle,
        });
        if (featuredProduct) {
          await Setting.updateOne(
            { name: "featuredProductId" },
            { value: featuredProduct._id },
            { upsert: true }
          );
        }
      }

      res.json({
        success: true,
        categoriesAdded,
        productsAdded,
      });
    } catch (error) {
      console.error("Seed error:", error);
      res.status(500).json({ error: error.message });
    }
  }
}

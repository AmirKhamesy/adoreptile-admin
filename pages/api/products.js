import { Product } from "@/models/Product";
import { mongooseConnect } from "@/lib/mongoose";
import { isAdminRequest } from "@/pages/api/auth/[...nextauth]";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const bucketName = "adoreptile";

export default async function handle(req, res) {
  const { method } = req;
  await mongooseConnect();
  await isAdminRequest(req, res);

  if (method === "GET") {
    const { id, category } = req.query;

    if (id) {
      // Fetch a single product by ID
      res.json(await Product.findOne({ _id: id }));
    } else if (category) {
      // Fetch products by category ID
      res.json(await Product.find({ category }));
    } else {
      // Fetch all products
      res.json(await Product.find());
    }
  }

  if (method === "POST") {
    console.log(req.body);
    const {
      title,
      description,
      price,
      images,
      category,
      properties,
      discounts,
      weight,
      dimensions,
    } = req.body;
    const productDoc = await Product.create({
      title,
      description,
      price,
      images,
      category,
      properties,
      discounts,
      weight,
      dimensions,
    });
    res.json(productDoc);
  }

  if (method === "PUT") {
    const {
      title,
      description,
      price,
      images,
      category,
      properties,
      discounts,
      weight,
      dimensions,
      _id,
    } = req.body;
    await Product.updateOne(
      { _id },
      {
        title,
        description,
        price,
        images,
        category,
        properties,
        discounts,
        weight,
        dimensions,
      }
    );
    res.json(true);
  }

  if (method === "DELETE") {
    if (req.query?.id) {
      const product = await Product.findOne({ _id: req.query.id });

      const client = new S3Client({
        region: "us-east-2",
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        },
      });

      for (const imageUrl of product.images) {
        const Key = imageUrl.split("/").pop();
        await client.send(
          new DeleteObjectCommand({
            Bucket: bucketName,
            Key: Key,
          })
        );
      }

      await Product.deleteOne({ _id: req.query.id });
      res.json(true);
    }
  }
}

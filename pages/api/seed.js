import { mongooseConnect } from "@/lib/mongoose";
import { isAdminRequest } from "@/pages/api/auth/[...nextauth]";
import { Category } from "@/models/Category";
import { Product } from "@/models/Product";
import { Setting } from "@/models/Setting";

export default async function handle(req, res) {
  await mongooseConnect();
  await isAdminRequest(req, res);

  if (req.method === "POST") {
    let toolsCategory = await Category.findOne({ name: "Tools" });
    if (!toolsCategory) {
      toolsCategory = await Category.create({
        name: "Tools",
        properties: [{ name: "type", values: ["feeders", "dirt"] }],
      });
    }

    let isopodsCategory = await Category.findOne({ name: "Isopods" });
    if (!isopodsCategory) {
      isopodsCategory = await Category.create({
        name: "Isopods",
        properties: [
          { name: "breed", values: ["rubber ducky", "zebra", "cow"] },
        ],
      });
    }

    const toolProducts = [
      {
        title: "Feeder Tool",
        description: "A handy tool for feeding.",
        price: Math.floor(Math.random() * 100) + 1,
        images: ["https://via.placeholder.com/500"],
        category: toolsCategory._id,
        properties: { type: "feeders" },
      },
      {
        title: "Dirt Tool",
        description: "Perfect for handling dirt.",
        price: Math.floor(Math.random() * 100) + 1,
        images: ["https://via.placeholder.com/500"],
        category: toolsCategory._id,
        properties: { type: "dirt" },
      },
    ];
    await Product.insertMany(toolProducts);

    const isopodProducts = [
      {
        title: "Rubber Ducky Isopod",
        description: "A cute rubber ducky isopod.",
        price: Math.floor(Math.random() * 100) + 1,
        images: ["https://via.placeholder.com/500"],
        category: isopodsCategory._id,
        properties: { breed: "rubber ducky" },
      },
      {
        title: "Zebra Isopod",
        description: "A stylish zebra-striped isopod.",
        price: Math.floor(Math.random() * 100) + 1,
        images: ["https://via.placeholder.com/500"],
        category: isopodsCategory._id,
        properties: { breed: "zebra" },
      },
      {
        title: "Cow Isopod",
        description: "A cow-patterned isopod.",
        price: Math.floor(Math.random() * 100) + 1,
        images: ["https://via.placeholder.com/500"],
        category: isopodsCategory._id,
        properties: { breed: "cow" },
      },
    ];
    const createdIsopodProducts = await Product.insertMany(isopodProducts);

    const featuredIsopod = createdIsopodProducts[0];
    await Setting.updateOne(
      { name: "featuredProductId" },
      { value: featuredIsopod._id },
      { upsert: true }
    );

    res.json({ success: true });
  }
}

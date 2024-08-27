import { mongooseConnect } from "@/lib/mongoose";
import { isAdminRequest } from "@/pages/api/auth/[...nextauth]";
import { Category } from "@/models/Category";
import { Product } from "@/models/Product";
import { Setting } from "@/models/Setting";

export default async function handle(req, res) {
  await mongooseConnect();
  await isAdminRequest(req, res);

  if (req.method === "POST") {
    const categories = [
      {
        name: "Tools",
        properties: [
          {
            name: "type",
            values: [
              "feeders",
              "dirt",
              "cleaning",
              "maintenance",
              "watering",
              "trimming",
            ],
          },
        ],
      },
      {
        name: "Isopods",
        properties: [
          {
            name: "breed",
            values: [
              "rubber ducky",
              "zebra",
              "cow",
              "giant orange",
              "blue",
              "red",
              "tiger",
              "harlequin",
            ],
          },
        ],
      },
      {
        name: "Accessories",
        properties: [
          {
            name: "type",
            values: ["decoration", "habitat", "lighting", "substrate"],
          },
        ],
      },
    ];

    for (const categoryData of categories) {
      let category = await Category.findOne({ name: categoryData.name });
      if (!category) {
        category = await Category.create(categoryData);
      }
      categoryData._id = category._id;
    }

    const products = [
      {
        title: "Feeder Tool",
        description: "A handy tool for feeding small animals and insects.",
        price: Math.floor(Math.random() * 100) + 1,
        images: ["https://via.placeholder.com/500"],
        category: categories[0]._id,
        properties: { type: "feeders" },
      },
      {
        title: "Dirt Tool",
        description: "Perfect for handling and moving dirt in habitats.",
        price: Math.floor(Math.random() * 100) + 1,
        images: ["https://via.placeholder.com/500"],
        category: categories[0]._id,
        properties: { type: "dirt" },
      },
      {
        title: "Cleaning Brush",
        description: "A durable brush for cleaning enclosures.",
        price: Math.floor(Math.random() * 100) + 1,
        images: ["https://via.placeholder.com/500"],
        category: categories[0]._id,
        properties: { type: "cleaning" },
      },
      {
        title: "Maintenance Kit",
        description: "A comprehensive kit for general maintenance tasks.",
        price: Math.floor(Math.random() * 100) + 1,
        images: ["https://via.placeholder.com/500"],
        category: categories[0]._id,
        properties: { type: "maintenance" },
      },
      {
        title: "Watering Can",
        description: "A practical watering can for keeping habitats moist.",
        price: Math.floor(Math.random() * 100) + 1,
        images: ["https://via.placeholder.com/500"],
        category: categories[0]._id,
        properties: { type: "watering" },
      },
      {
        title: "Trimming Scissors",
        description:
          "Sharp scissors for trimming plants and materials in habitats.",
        price: Math.floor(Math.random() * 100) + 1,
        images: ["https://via.placeholder.com/500"],
        category: categories[0]._id,
        properties: { type: "trimming" },
      },
      {
        title: "Rubber Ducky Isopod",
        description:
          "A rare and cute rubber ducky isopod, known for its unique appearance.",
        price: Math.floor(Math.random() * 100) + 1,
        images: ["https://via.placeholder.com/500"],
        category: categories[1]._id,
        properties: { breed: "rubber ducky" },
      },
      {
        title: "Zebra Isopod",
        description:
          "A stylish zebra-striped isopod, popular among collectors.",
        price: Math.floor(Math.random() * 100) + 1,
        images: ["https://via.placeholder.com/500"],
        category: categories[1]._id,
        properties: { breed: "zebra" },
      },
      {
        title: "Cow Isopod",
        description:
          "A cow-patterned isopod, known for its distinct black and white spots.",
        price: Math.floor(Math.random() * 100) + 1,
        images: ["https://via.placeholder.com/500"],
        category: categories[1]._id,
        properties: { breed: "cow" },
      },
      {
        title: "Giant Orange Isopod",
        description: "A large and vibrant orange isopod, easy to care for.",
        price: Math.floor(Math.random() * 100) + 1,
        images: ["https://via.placeholder.com/500"],
        category: categories[1]._id,
        properties: { breed: "giant orange" },
      },
      {
        title: "Blue Isopod",
        description: "An eye-catching blue isopod with a bright, unique color.",
        price: Math.floor(Math.random() * 100) + 1,
        images: ["https://via.placeholder.com/500"],
        category: categories[1]._id,
        properties: { breed: "blue" },
      },
      {
        title: "Red Isopod",
        description:
          "A striking red isopod, adding vibrant color to any collection.",
        price: Math.floor(Math.random() * 100) + 1,
        images: ["https://via.placeholder.com/500"],
        category: categories[1]._id,
        properties: { breed: "red" },
      },
      {
        title: "Tiger Isopod",
        description: "A tiger-striped isopod with distinctive markings.",
        price: Math.floor(Math.random() * 100) + 1,
        images: ["https://via.placeholder.com/500"],
        category: categories[1]._id,
        properties: { breed: "tiger" },
      },
      {
        title: "Harlequin Isopod",
        description:
          "A beautifully patterned harlequin isopod, known for its colorful appearance.",
        price: Math.floor(Math.random() * 100) + 1,
        images: ["https://via.placeholder.com/500"],
        category: categories[1]._id,
        properties: { breed: "harlequin" },
      },
      {
        title: "Habitat Decoration",
        description: "A natural-looking decoration for isopod habitats.",
        price: Math.floor(Math.random() * 100) + 1,
        images: ["https://via.placeholder.com/500"],
        category: categories[2]._id,
        properties: { type: "decoration" },
      },
      {
        title: "LED Habitat Light",
        description:
          "Energy-efficient LED light for illuminating isopod habitats.",
        price: Math.floor(Math.random() * 100) + 1,
        images: ["https://via.placeholder.com/500"],
        category: categories[2]._id,
        properties: { type: "lighting" },
      },
      {
        title: "Special Substrate Mix",
        description:
          "A blend of substrate materials ideal for isopod habitats.",
        price: Math.floor(Math.random() * 100) + 1,
        images: ["https://via.placeholder.com/500"],
        category: categories[2]._id,
        properties: { type: "substrate" },
      },
    ];

    for (const productData of products) {
      const existingProduct = await Product.findOne({
        title: productData.title,
      });
      if (!existingProduct) {
        await Product.create(productData);
      }
    }

    const featuredIsopod = await Product.findOne({
      title: "Rubber Ducky Isopod",
    });
    if (featuredIsopod) {
      await Setting.updateOne(
        { name: "featuredProductId" },
        { value: featuredIsopod._id },
        { upsert: true }
      );
    }

    res.json({ success: true });
  }
}

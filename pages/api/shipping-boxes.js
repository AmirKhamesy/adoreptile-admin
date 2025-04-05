import { mongooseConnect } from "@/lib/mongoose";
import { isAdminRequest } from "@/pages/api/auth/[...nextauth]";
import { ShippingBox } from "@/models/ShippingBox";

export default async function handle(req, res) {
  const { method } = req;
  await mongooseConnect();
  await isAdminRequest(req, res);

  if (method === "GET") {
    if (req.query?.id) {
      res.json(await ShippingBox.findOne({ _id: req.query.id }));
    } else {
      res.json(await ShippingBox.find());
    }
  }

  if (method === "POST") {
    const { name, description, dimensions, maxWeight, isDefault } = req.body;

    if (isDefault) {
      // If this box is being set as default, remove default flag from other boxes
      await ShippingBox.updateMany({}, { isDefault: false });
    }

    const shippingBoxDoc = await ShippingBox.create({
      name,
      description,
      dimensions,
      maxWeight,
      isDefault,
    });
    res.json(shippingBoxDoc);
  }

  if (method === "PUT") {
    const { name, description, dimensions, maxWeight, isDefault, _id } =
      req.body;

    if (isDefault) {
      // If this box is being set as default, remove default flag from other boxes
      await ShippingBox.updateMany({ _id: { $ne: _id } }, { isDefault: false });
    }

    await ShippingBox.updateOne(
      { _id },
      { name, description, dimensions, maxWeight, isDefault }
    );
    res.json(true);
  }

  if (method === "DELETE") {
    if (req.query?.id) {
      await ShippingBox.deleteOne({ _id: req.query.id });
      res.json(true);
    }
  }
}

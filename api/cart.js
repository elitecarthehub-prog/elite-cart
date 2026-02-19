import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
  await client.connect();
  const db = client.db("elitecart");
  const carts = db.collection("carts");

  const { guestId } = req.query;

  if (!guestId) {
    return res.status(400).json({ error: "Guest ID required" });
  }

  if (req.method === "GET") {
    const cart = await carts.findOne({ guestId });
    return res.json(cart || { guestId, items: [] });
  }

  if (req.method === "POST") {
    const { item } = req.body;

    const existing = await carts.findOne({ guestId });

    if (!existing) {
      await carts.insertOne({
        guestId,
        items: [item],
        updatedAt: new Date()
      });
    } else {
      const index = existing.items.findIndex(i => i.productId === item.productId);

      if (index > -1) {
        existing.items[index].qty += 1;
      } else {
        existing.items.push(item);
      }

      await carts.updateOne(
        { guestId },
        { $set: { items: existing.items, updatedAt: new Date() } }
      );
    }

    return res.json({ success: true });
  }

  if (req.method === "DELETE") {
    await carts.deleteOne({ guestId });
    return res.json({ success: true });
  }
}

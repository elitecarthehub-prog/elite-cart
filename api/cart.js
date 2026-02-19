import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI;

if (!uri) {
  throw new Error("MONGO_URI not defined");
}

const client = new MongoClient(uri);
let cachedDb = null;

async function getDb() {
  if (!cachedDb) {
    await client.connect();
    cachedDb = client.db("elitecart");
  }
  return cachedDb;
}

export default async function handler(req, res) {

  // 🔥 CORS HEADERS (Required for GitHub Pages → Vercel)
  res.setHeader("Access-Control-Allow-Origin", "https://elitecart.pro");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const db = await getDb();
    const carts = db.collection("carts");

    const { guestId } = req.query;

    if (!guestId) {
      return res.status(400).json({ error: "Guest ID required" });
    }

    // =========================
    // GET CART
    // =========================
    if (req.method === "GET") {
      const cart = await carts.findOne({ guestId });
      return res.status(200).json(cart || { guestId, items: [] });
    }

    // =========================
    // ADD PRODUCT
    // =========================
    if (req.method === "POST") {
      const { item } = req.body;

      if (!item || !item.productId) {
        return res.status(400).json({ error: "Invalid product data" });
      }

      const existingCart = await carts.findOne({ guestId });

      if (!existingCart) {
        await carts.insertOne({
          guestId,
          items: [{ ...item, qty: 1 }],
          updatedAt: new Date()
        });
      } else {
        const index = existingCart.items.findIndex(
          p => p.productId === item.productId
        );

        if (index > -1) {
          existingCart.items[index].qty += 1;
        } else {
          existingCart.items.push({ ...item, qty: 1 });
        }

        await carts.updateOne(
          { guestId },
          { $set: { items: existingCart.items, updatedAt: new Date() } }
        );
      }

      return res.status(200).json({ success: true });
    }

    // =========================
    // UPDATE QUANTITY
    // =========================
    if (req.method === "PUT") {
      const { productId, qty } = req.body;

      if (!productId || qty == null) {
        return res.status(400).json({ error: "Invalid update data" });
      }

      if (qty <= 0) {
        await carts.updateOne(
          { guestId },
          { $pull: { items: { productId } } }
        );
      } else {
        await carts.updateOne(
          { guestId, "items.productId": productId },
          { $set: { "items.$.qty": qty, updatedAt: new Date() } }
        );
      }

      return res.status(200).json({ success: true });
    }

    // =========================
    // REMOVE SINGLE PRODUCT
    // =========================
    if (req.method === "DELETE") {
      const { productId } = req.body;

      if (!productId) {
        return res.status(400).json({ error: "Product ID required" });
      }

      await carts.updateOne(
        { guestId },
        { $pull: { items: { productId } } }
      );

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method Not Allowed" });

  } catch (error) {
    console.error("Cart API Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

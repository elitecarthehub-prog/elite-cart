import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGO_URI);

export default async function handler(req, res) {
  try {
    await client.connect();
    const db = client.db("elitecart");
    const products = db.collection("products");

    if (req.method === "GET") {
      const data = await products.find({}).sort({ createdAt: -1 }).toArray();
      return res.status(200).json(data);
    }

    if (req.method === "POST") {
      const body = req.body;

      await products.insertOne({
        name: body.name,
        price: body.price,
        oldPrice: body.oldPrice || null,
        image: body.image,
        description: body.description || "",
        active: true,
        createdAt: new Date()
      });

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
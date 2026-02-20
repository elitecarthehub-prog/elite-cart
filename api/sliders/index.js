import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGO_URI);

export default async function handler(req, res) {
  try {
    await client.connect();
    const db = client.db("elitecart");
    const sliders = db.collection("sliders");

    if (req.method === "GET") {
      const data = await sliders.find({ active: true }).sort({ order: 1 }).toArray();
      return res.status(200).json(data);
    }

    if (req.method === "POST") {
      const body = req.body;

      await sliders.insertOne({
        imageUrl: body.imageUrl,
        order: body.order || 1,
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
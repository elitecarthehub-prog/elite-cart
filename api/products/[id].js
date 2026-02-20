import { MongoClient, ObjectId } from "mongodb";

const client = new MongoClient(process.env.MONGO_URI);

export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "https://elitecart.pro");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    await client.connect();
    const db = client.db("elitecart");
    const products = db.collection("products");

    const { id } = req.query;

    if (req.method === "DELETE") {
      await products.deleteOne({ _id: new ObjectId(id) });
      return res.status(200).json({ success: true });
    }

    if (req.method === "PUT") {
      await products.updateOne(
        { _id: new ObjectId(id) },
        { $set: req.body }
      );
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method Not Allowed" });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

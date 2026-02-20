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
    const sliders = db.collection("sliders");
    const { id } = req.query;

    if (req.method === "PUT") {
      await sliders.updateOne(
        { _id: new ObjectId(id) },
        { $set: req.body }
      );
      return res.status(200).json({ success: true });
    }

    if (req.method === "DELETE") {
      await sliders.deleteOne({ _id: new ObjectId(id) });
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }

}

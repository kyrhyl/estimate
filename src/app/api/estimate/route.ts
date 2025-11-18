import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = "quantityestimate";

async function getClient() {
  const client = new MongoClient(uri);
  await client.connect();
  return client;
}

export async function POST(request: Request) {
  const data = await request.json();
  const client = await getClient();
  const db = client.db(dbName);
  const collection = db.collection("estimates");
  const result = await collection.insertOne(data);
  await client.close();
  return NextResponse.json({ success: true, id: result.insertedId });
}

export async function GET() {
  const client = await getClient();
  const db = client.db(dbName);
  const collection = db.collection("estimates");
  const estimates = await collection.find({}).toArray();
  await client.close();
  return NextResponse.json(estimates);
}

import { MongoClient } from "mongodb";

const THREAT_COLLECTION = "Threats";

const FALLBACK_THREATS = [
  {
    package: "axios",
    version: "1.14.1",
    severity: "critical",
    attack: "Shai-Hulud",
    fixedVersion: "1.14.3",
    reason: "Known supply-chain attack",
  },
];

let db = null;
let useFallback = true;

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn("Using in-memory threat database");
    return;
  }

  try {
    const client = new MongoClient(uri);

    await client.connect();

    db = client.db();

    useFallback = false;

    console.log("Connected to MongoDB");
  } catch (err) {
    console.warn("MongoDB unavailable, using fallback DB");
  }
}

export async function checkThreatIntel(packageName, version) {
  packageName = packageName.toLowerCase();

  if (useFallback || !db) {
    return (
      FALLBACK_THREATS.find(
        t =>
          t.package === packageName &&
          t.version === version
      ) || null
    );
  }

  try {
    return await db.collection(THREAT_COLLECTION).findOne({
      package: packageName,
      version,
    });
  } catch (err) {
    console.error("Threat lookup failed:", err.message);

    return (
      FALLBACK_THREATS.find(
        t =>
          t.package === packageName &&
          t.version === version
      ) || null
    );
  }
}
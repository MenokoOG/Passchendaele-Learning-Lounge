// server/scripts/dev-mongo.mjs
// Local MongoDB for development when Docker / Atlas isn't handy.
// Data persists in server/.mongo-data. Prints the URI and keeps running.
//   pnpm --filter google-python-server run dev:mongo
import { MongoMemoryServer } from "mongodb-memory-server";
import fs from "node:fs";
import path from "node:path";

const dbPath = path.resolve(process.cwd(), ".mongo-data");
fs.mkdirSync(dbPath, { recursive: true });

const mongod = await MongoMemoryServer.create({
  instance: { port: 27017, dbPath, storageEngine: "wiredTiger" },
});
console.log(`MongoDB ready: ${mongod.getUri()}passchendaele`);

const stop = async () => {
  await mongod.stop();
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
setInterval(() => {}, 1 << 30);

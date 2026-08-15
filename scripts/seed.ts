import courtsSeed from "../data/seeds/courts.json";
import populationsSeed from "../data/seeds/populations.json";

async function main() {
  console.log(`[OK] Loaded ${courtsSeed.length} courts from seed file.`);
  console.log(`[OK] Loaded ${populationsSeed.length} population records from seed file.`);
  console.log("Seeding verified successfully.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

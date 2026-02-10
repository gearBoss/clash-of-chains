import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create demo players
  const players = [
    { id: "0x1111111111111111111111111111111111111111", rating: 1200, wins: 10, losses: 5 },
    { id: "0x2222222222222222222222222222222222222222", rating: 1050, wins: 8, losses: 7 },
    { id: "0x3333333333333333333333333333333333333333", rating: 950,  wins: 3, losses: 6 },
    { id: "0x4444444444444444444444444444444444444444", rating: 1100, wins: 12, losses: 8 },
    { id: "0x5555555555555555555555555555555555555555", rating: 1000, wins: 0, losses: 0 },
  ];

  for (const p of players) {
    await prisma.player.upsert({
      where: { id: p.id },
      update: p,
      create: {
        ...p,
        deckCardIds: JSON.stringify([1, 2, 3, 4, 5, 15, 16, 17, 24, 25, 33, 34, 35, 39, 40]),
      },
    });
  }

  console.log(`Created ${players.length} demo players`);
  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

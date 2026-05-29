import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed the database.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  console.log("Starting seed...");

  await prisma.metric.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.team.deleteMany();
  await prisma.user.deleteMany();

  const user = await prisma.user.create({
    data: {
      email: "demo@example.com",
      name: "Demo User",
      role: "ADMIN",
    },
  });

  const team = await prisma.team.create({
    data: {
      name: "Demo Team",
      slug: "demo-team",
      ownerId: user.id,
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { teamId: team.id },
  });

  await prisma.metric.createMany({
    data: [
      { teamId: team.id, key: "monthly_revenue", value: 2450 },
      { teamId: team.id, key: "active_users", value: 1240 },
      { teamId: team.id, key: "engagement_rate", value: 6.5 },
      { teamId: team.id, key: "total_followers", value: 85200 },
    ],
  });

  console.log("Seed completed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

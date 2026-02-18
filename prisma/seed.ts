import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create sample users
  const user1 = await prisma.user.upsert({
    where: { email: "ali.yilmaz@bilkent.edu.tr" },
    update: {},
    create: {
      clerkId: "seed_user_1",
      email: "ali.yilmaz@bilkent.edu.tr",
      name: "Ali Yılmaz",
      phone: "+90 532 111 2233",
      carModel: "Honda Civic 2020",
      carPlate: "06 ABC 123",
      bio: "CS senior, daily commuter from Çayyolu",
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "ayse.demir@bilkent.edu.tr" },
    update: {},
    create: {
      clerkId: "seed_user_2",
      email: "ayse.demir@bilkent.edu.tr",
      name: "Ayşe Demir",
      phone: "+90 533 444 5566",
      carModel: "Toyota Yaris 2022",
      carPlate: "06 XYZ 789",
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: "mehmet.kaya@bilkent.edu.tr" },
    update: {},
    create: {
      clerkId: "seed_user_3",
      email: "mehmet.kaya@bilkent.edu.tr",
      name: "Mehmet Kaya",
    },
  });

  // Create sample rides
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(8, 30, 0, 0);

  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  dayAfter.setHours(17, 0, 0, 0);

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(10, 0, 0, 0);

  await prisma.ride.createMany({
    data: [
      {
        driverId: user1.id,
        origin: "Çayyolu",
        destination: "Bilkent Üniversitesi (Kampüs)",
        dateTime: tomorrow,
        seatsTotal: 3,
        seatsAvailable: 3,
        price: 30,
        meetingPoint: "Çayyolu metro çıkışı",
        notes: "Morning commute, leaving sharp at 8:30",
      },
      {
        driverId: user2.id,
        origin: "Bilkent Üniversitesi (Kampüs)",
        destination: "Kızılay",
        dateTime: dayAfter,
        seatsTotal: 2,
        seatsAvailable: 2,
        price: 25,
        meetingPoint: "Main Gate",
        womenOnly: true,
      },
      {
        driverId: user1.id,
        origin: "Bilkent Üniversitesi (Kampüs)",
        destination: "AŞTİ",
        dateTime: nextWeek,
        seatsTotal: 4,
        seatsAvailable: 4,
        price: 40,
        notes: "Going to AŞTİ for weekend trip, can drop off along the way",
      },
      {
        driverId: user2.id,
        origin: "Tunus / Tunalı",
        destination: "Bilkent Üniversitesi (Kampüs)",
        dateTime: tomorrow,
        seatsTotal: 3,
        seatsAvailable: 2,
        price: 20,
        meetingPoint: "Tunalı Hilmi Caddesi, Starbucks karşısı",
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Seed complete!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });

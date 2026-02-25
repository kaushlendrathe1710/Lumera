import { db } from "./db";
import { products, users } from "@shared/schema";
import { eq } from "drizzle-orm";

const SUPER_ADMIN_EMAIL = "kaushlendrs.k12@fms.edu";

const sampleProducts: any[] = [
  {
    name: "Premium Sidr Honey",
    description: "Sourced from the ancient Sidr trees of Yemen, this premium honey is known for its rich, caramel-like flavor and exceptional health benefits. Perfect for daily use or as a luxurious gift.",
    price: "350.00",
    category: "Raw Honey",
    stock: 50,
    weight: "500g",
    origin: "Yemen",
    isActive: true,
  },
  {
    name: "Wild Flower Honey",
    description: "A delightful blend of nectar from various wild flowers found in the pristine mountains of UAE. Light, floral, and perfect for everyday sweetening.",
    price: "120.00",
    category: "Raw Honey",
    stock: 100,
    weight: "500g",
    origin: "UAE",
    isActive: true,
  },
  {
    name: "Manuka Honey",
    description: "Imported from New Zealand, our Manuka honey has a unique taste and remarkable antibacterial properties. Certified with MGO 400+ for maximum potency.",
    price: "450.00",
    category: "Premium Honey",
    stock: 30,
    weight: "250g",
    origin: "New Zealand",
    isActive: true,
  },
  {
    name: "Pure Honeycomb",
    description: "Experience honey in its most natural form. Our fresh honeycomb is harvested with care, preserving the beeswax and all the natural enzymes and nutrients.",
    price: "180.00",
    category: "Honeycomb",
    stock: 40,
    weight: "400g",
    origin: "UAE",
    isActive: true,
  },
  {
    name: "Acacia Honey",
    description: "Known for its light color and mild, sweet taste, Acacia honey is perfect for those who prefer a delicate flavor. Great for tea and baking.",
    price: "95.00",
    category: "Raw Honey",
    stock: 80,
    weight: "500g",
    origin: "Hungary",
    isActive: true,
  },
  {
    name: "Royal Jelly Honey Blend",
    description: "A powerful combination of pure honey enriched with royal jelly. Known for its energy-boosting properties and immune support benefits.",
    price: "220.00",
    category: "Specialty Honey",
    stock: 45,
    weight: "350g",
    origin: "UAE",
    isActive: true,
  },
  {
    name: "Black Seed Honey",
    description: "Pure honey infused with black seed (Nigella sativa) for added health benefits. A traditional remedy known for centuries in Middle Eastern cultures.",
    price: "165.00",
    category: "Specialty Honey",
    stock: 60,
    weight: "500g",
    origin: "UAE",
    isActive: true,
  },
  {
    name: "Organic Forest Honey",
    description: "Collected from bees foraging in organic certified forests. Dark, rich, and full of antioxidants. Perfect for health-conscious honey lovers.",
    price: "140.00",
    category: "Organic Honey",
    stock: 55,
    weight: "500g",
    origin: "Turkey",
    isActive: true,
  },
];

export async function seedDatabase() {
  try {
    const existingProducts = await db.select().from(products).limit(1);

    if (existingProducts.length === 0) {
      console.log("Seeding database with sample products...");

      for (const product of sampleProducts) {
        await db.insert(products).values(product);
      }

      console.log(`Seeded ${sampleProducts.length} products`);
    } else {
      console.log("Database already has products, skipping seed");
    }

    const superAdmin = await db.select().from(users).where(eq(users.email, SUPER_ADMIN_EMAIL)).limit(1);

    if (superAdmin.length === 0) {
      console.log("Creating super admin user...");
      await db.insert(users).values({
        email: SUPER_ADMIN_EMAIL,
        name: "Super Admin",
        role: "superadmin",
        isRegistered: true,
      });
      console.log("Super admin created");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

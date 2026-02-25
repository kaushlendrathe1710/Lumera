import { db } from "./db";
import { categories, products, users } from "@shared/schema";
import { eq } from "drizzle-orm";
import "dotenv/config";

const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL!;
const mandatoryCategory={
  id:"1",
  name:"uncategorized",
  slug:"uncategorized",
  description:"products without any category",
}

const sampleProducts: any[] = [
  {
    name: "Midnight Oud",
    description:
      "A deep and luxurious fragrance with rich oud, warm amber, and subtle vanilla notes. Perfect for evening wear.",
    shortDescription: "Luxurious oud with amber warmth.",
    price: "129.99",
    comparePrice: "159.99",
    discountPercent: 18,
    imageUrl: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    images: [
      "https://images.unsplash.com/photo-1592842414746-a2fd2101381f?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1592842414859-bca1263fabc2?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    ],
    categoryId: "1",
    sku: "PO-MO-001",
    stock: 50,
    weight: "100ml",
    origin: "France",
    isFeatured: true,
    isActive: true,
  },
  {
    name: "Rose Elixir",
    description:
      "A romantic blend of fresh rose petals, peony, and soft musk. Light, elegant, and timeless.",
    shortDescription: "Fresh rose with soft musk.",
    price: "89.99",
    comparePrice: "109.99",
    discountPercent: 15,
    imageUrl: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDV8fHxlbnwwfHx8fHw%3D",
    images: [
      "https://images.unsplash.com/photo-1631701258001-e0db10d455e1?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDF8fHxlbnwwfHx8fHw%3D",
      "https://images.unsplash.com/photo-1631701109521-10e0dc55fe8f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDl8fHxlbnwwfHx8fHw%3D"
    ],
    categoryId: "1",
    sku: "PO-RE-002",
    stock: 75,
    weight: "75ml",
    origin: "Italy",
    isFeatured: false,
    isActive: true,
  },
  {
    name: "Citrus Noir",
    description:
      "A bold fusion of bergamot, lemon zest, and black pepper layered over woody undertones.",
    shortDescription: "Fresh citrus with a spicy twist.",
    price: "99.99",
    comparePrice: "119.99",
    discountPercent: 17,
    imageUrl: "https://images.unsplash.com/photo-1613742454955-889ff20becda?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    images: [
      "https://images.unsplash.com/photo-1733660227163-01bc46e0d7d7?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDd8fHxlbnwwfHx8fHw%3D",
    ],
    categoryId: "1",
    sku: "PO-CN-003",
    stock: 60,
    weight: "100ml",
    origin: "Spain",
    isFeatured: true,
    isActive: true,
  },
];
export async function seedDatabase() {
  try {
    const category = await db.select().from(categories).where(eq(categories.id,"1"));
    if(!category.length){
      await db.insert(categories).values(mandatoryCategory);
    }
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

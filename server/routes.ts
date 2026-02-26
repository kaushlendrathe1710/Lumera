import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import pg from "pg";
import { storage } from "./storage";
import { sendOtpEmail, generateOtp } from "./email";
import {
  insertProductSchema,
  insertOrderSchema,
  insertReviewSchema,
  insertCategorySchema,
  insertSupportedCountrySchema,
  insertAddressSchema,
  type OrderStatus,
  type PaymentStatus,
  type PaymentMethod,
  insertContactDetailSchema,
} from "@shared/schema";
import { z } from "zod";
import { registerS3Routes } from "./s3-routes";
import { getStripeClient, getStripePublishableKey } from "./stripeClient";
import { canTransitionOrderStatus } from "./utils";

declare module "express-session" {
  interface SessionData {
    userId?: string;
    pendingEmail?: string;
  }
}

const SUPER_ADMIN_EMAIL = "kaushlendra.k12@fms.edu";

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const user = await storage.getUser(req.session.userId);
  if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
}

async function requireSuperAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const user = await storage.getUser(req.session.userId);
  if (!user || user.role !== "superadmin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  // Set up PostgreSQL session store for persistent sessions
  const PgSession = connectPgSimple(session);
  const sessionPool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });

  app.use(
    session({
      store: new PgSession({
        pool: sessionPool,
        tableName: "user_sessions",
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET || "golden-harvest-secret-key-2026",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: "lax",
      },
    }),
  );

  // Register object storage routes for file uploads
  registerS3Routes(app);

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.json(null);
    }
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      req.session.destroy(() => {});
      return res.json(null);
    }
    res.json(user);
  });

  app.post("/api/auth/send-otp", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email || typeof email !== "string") {
        return res.status(400).json({ error: "Email is required" });
      }

      const normalizedEmail = email.toLowerCase().trim();
      const existingUser = await storage.getUserByEmail(normalizedEmail);
      const isNewUser = !existingUser;

      const otp = generateOtp();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await storage.createOtpToken({
        email: normalizedEmail,
        otp,
        expiresAt,
      });

      const sent = await sendOtpEmail(normalizedEmail, otp);
      if (!sent) {
        console.error("Email sending failed for", normalizedEmail);
        storage.deleteOtpTokens(normalizedEmail).catch((delErr) => {
          console.error(
            "Failed to delete OTP tokens after email error:",
            delErr,
          );
        });
        return res
          .status(500)
          .json({ error: "Failed to send OTP email. Please try again." });
      }

      req.session.pendingEmail = normalizedEmail;

      res.json({ success: true, isNewUser });
    } catch (error) {
      console.error("Send OTP error:", error);
      res.status(500).json({ error: "Failed to send OTP" });
    }
  });

  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        return res.status(400).json({ error: "Email and OTP are required" });
      }

      const normalizedEmail = email.toLowerCase().trim();
      const token = await storage.getValidOtpToken(normalizedEmail, otp);

      if (!token) {
        return res.status(400).json({ error: "Invalid or expired OTP" });
      }

      await storage.deleteOtpTokens(normalizedEmail);

      let user = await storage.getUserByEmail(normalizedEmail);

      if (!user) {
        if (normalizedEmail === SUPER_ADMIN_EMAIL) {
          user = await storage.createUser({
            email: normalizedEmail,
            name: "Super Admin",
            role: "superadmin",
            isRegistered: true,
          });
          req.session.userId = user.id;
          return req.session.save((err) => {
            if (err) {
              console.error("Session save error:", err);
              return res
                .status(500)
                .json({ error: "Login failed. Please try again." });
            }
            res.json({ success: true, user, requiresRegistration: false });
          });
        }
        user = await storage.createUser({
          email: normalizedEmail,
          role: "customer",
          isRegistered: false,
        });
        req.session.userId = user.id;
        return req.session.save((err) => {
          if (err) {
            console.error("Session save error:", err);
            return res
              .status(500)
              .json({ error: "Login failed. Please try again." });
          }
          res.json({ success: true, user, requiresRegistration: true });
        });
      }

      if (!user.isRegistered && user.role === "customer") {
        req.session.userId = user.id;
        return req.session.save((err) => {
          if (err) {
            console.error("Session save error:", err);
            return res
              .status(500)
              .json({ error: "Login failed. Please try again." });
          }
          res.json({ success: true, user, requiresRegistration: true });
        });
      }

      req.session.userId = user.id;
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res
            .status(500)
            .json({ error: "Login failed. Please try again." });
        }
        res.json({ success: true, user, requiresRegistration: false });
      });
    } catch (error) {
      console.error("Verify OTP error:", error);
      res.status(500).json({ error: "Failed to verify OTP" });
    }
  });

  app.post("/api/auth/register", requireAuth, async (req, res) => {
    try {
      const { name, countryId, phoneNumber } = req.body;
      if (!name || !countryId || !phoneNumber) {
        return res
          .status(400)
          .json({ error: "Name, country and phone number are required" });
      }

      // Validate country exists
      const country = await storage.getSupportedCountry(countryId);
      if (!country) {
        return res.status(400).json({ error: "Invalid country selected" });
      }

      // Validate phone number format (only digits)
      if (!/^\d+$/.test(phoneNumber)) {
        return res
          .status(400)
          .json({ error: "Phone number must contain only digits" });
      }

      // Validate phone number length
      if (phoneNumber.length !== country.phoneLength) {
        return res.status(400).json({
          error: `Phone number must be ${country.phoneLength} digits for ${country.name}`,
        });
      }

      const user = await storage.updateUser(req.session.userId!, {
        name,
        countryId,
        phoneNumber,
        isRegistered: true,
      });

      res.json({ success: true, user });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ error: "Failed to complete registration" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ success: true });
    });
  });

  // Category routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      console.error("Get categories error:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/active", async (req, res) => {
    try {
      const categories = await storage.getActiveCategories();
      res.json(categories);
    } catch (error) {
      console.error("Get active categories error:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/:id", async (req, res) => {
    try {
      const id = req.params.id as string;
      const category = await storage.getCategory(id);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Get category error:", error);
      res.status(500).json({ error: "Failed to fetch category" });
    }
  });

  // Contact details - public
  app.get("/api/contact-details", async (req, res) => {
    try {
      const items = await storage.getAllContactDetails();
      res.json(items);
    } catch (error) {
      console.error("Get contact details error:", error);
      res.status(500).json({ error: "Failed to fetch contact details" });
    }
  });

  app.get("/api/contact-details/:id", async (req, res) => {
    try {
      const id = req.params.id as string;
      const item = await storage.getContactDetail(id);
      if (!item) return res.status(404).json({ error: "Not found" });
      res.json(item);
    } catch (error) {
      console.error("Get contact detail error:", error);
      res.status(500).json({ error: "Failed to fetch contact detail" });
    }
  });

  // Admin CRUD
  app.post("/api/admin/contact-details", requireAdmin, async (req, res) => {
    try {
      const data = insertContactDetailSchema.parse(req.body);
      const created = await storage.createContactDetail(data);
      res.json(created);
    } catch (error) {
      console.error("Create contact detail error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: "Failed to create contact detail" });
    }
  });

  app.put("/api/admin/contact-details/:id", requireAdmin, async (req, res) => {
    try {
      const id = req.params.id as string;
      const data = insertContactDetailSchema.partial().parse(req.body);
      const updated = await storage.updateContactDetail(id, data);
      if (!updated) return res.status(404).json({ error: "Not found" });
      res.json(updated);
    } catch (error) {
      console.error("Update contact detail error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: "Failed to update contact detail" });
    }
  });

  app.delete("/api/admin/contact-details/:id", requireAdmin, async (req, res) => {
    try {
      const id = req.params.id as string;
      await storage.deleteContactDetail(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete contact detail error:", error);
      res.status(500).json({ error: "Failed to delete contact detail" });
    }
  });

  app.post("/api/admin/categories", requireAdmin, async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);

      // Check if slug already exists
      const existing = await storage.getCategoryBySlug(categoryData.slug);
      if (existing) {
        return res
          .status(400)
          .json({ error: "Category with this slug already exists" });
      }

      const category = await storage.createCategory(categoryData);
      res.json(category);
    } catch (error) {
      console.error("Create category error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: "Failed to create category" });
    }
  });

  app.patch("/api/admin/categories/:id", requireAdmin, async (req, res) => {
    try {
      const id = req.params.id as string;
      const categoryData = insertCategorySchema.partial().parse(req.body);

      // Check if slug is being changed and if new slug already exists
      if (categoryData.slug) {
        const existing = await storage.getCategoryBySlug(categoryData.slug);
        if (existing && existing.id !== id) {
          return res
            .status(400)
            .json({ error: "Category with this slug already exists" });
        }
      }

      const category = await storage.updateCategory(id, categoryData);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Update category error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: "Failed to update category" });
    }
  });

  app.delete("/api/admin/categories/:id", requireAdmin, async (req, res) => {
    try {
      const id = req.params.id as string;
      await storage.deleteCategory(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete category error:", error);
      res.status(500).json({ error: "Failed to delete category" });
    }
  });

  // Supported Countries routes
  app.get("/api/countries", async (req, res) => {
    try {
      const countries = await storage.getAllSupportedCountries();
      res.json(countries);
    } catch (error) {
      console.error("Get countries error:", error);
      res.status(500).json({ error: "Failed to fetch countries" });
    }
  });

  app.get("/api/countries/:id", async (req, res) => {
    try {
      const id = req.params.id as string;
      const country = await storage.getSupportedCountry(id);
      if (!country) {
        return res.status(404).json({ error: "Country not found" });
      }
      res.json(country);
    } catch (error) {
      console.error("Get country error:", error);
      res.status(500).json({ error: "Failed to fetch country" });
    }
  });

  app.post("/api/admin/countries", requireAdmin, async (req, res) => {
    try {
      const countryData = insertSupportedCountrySchema.parse(req.body);

      // Check if ISO code already exists
      const existingIso = await storage.getSupportedCountryByIsoCode(
        countryData.isoCode,
      );
      if (existingIso) {
        return res
          .status(400)
          .json({ error: "Country with this ISO code already exists" });
      }

      const country = await storage.createSupportedCountry(countryData);
      res.json(country);
    } catch (error) {
      console.error("Create country error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: "Failed to create country" });
    }
  });

  app.put("/api/admin/countries/:id", requireAdmin, async (req, res) => {
    try {
      const id = req.params.id as string;
      const countryData = insertSupportedCountrySchema
        .partial()
        .parse(req.body);

      // Check if ISO code is being changed and if new ISO code already exists
      if (countryData.isoCode) {
        const existing = await storage.getSupportedCountryByIsoCode(
          countryData.isoCode,
        );
        if (existing && existing.id !== id) {
          return res
            .status(400)
            .json({ error: "Country with this ISO code already exists" });
        }
      }

      const country = await storage.updateSupportedCountry(id, countryData);
      if (!country) {
        return res.status(404).json({ error: "Country not found" });
      }
      res.json(country);
    } catch (error) {
      console.error("Update country error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: "Failed to update country" });
    }
  });

  app.delete("/api/admin/countries/:id", requireAdmin, async (req, res) => {
    try {
      const id = req.params.id as string;
      await storage.deleteSupportedCountry(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete country error:", error);
      res.status(500).json({ error: "Failed to delete country" });
    }
  });

  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      console.error("Get products error:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/search", async (req, res) => {
    try {
      const q = (req.query.q as string || "").trim();
      const categoryId = req.query.category as string | undefined;
      if (!q) {
        return res.json([]);
      }
      const results = await storage.searchProducts(q, categoryId);
      res.json(results);
    } catch (error) {
      console.error("Search products error:", error);
      res.status(500).json({ error: "Failed to search products" });
    }
  });

  app.get("/api/products/ratings/all", async (req, res) => {
    try {
      const ratings = await storage.getAllProductRatings();
      res.json(ratings);
    } catch (error) {
      console.error("Get all ratings error:", error);
      res.status(500).json({ error: "Failed to fetch ratings" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = req.params.id as string;
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Get product error:", error);
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.get("/api/products/:id/reviews", async (req, res) => {
    try {
      const productId = req.params.id as string;
      const reviews = await storage.getProductReviews(productId);
      const summary = await storage.getProductRatingSummary(productId);
      res.json({ reviews, ...summary });
    } catch (error) {
      console.error("Get reviews error:", error);
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  app.get("/api/products/:id/related", async (req, res) => {
    try {
      const productId = req.params.id as string;
      const limit = req.query.limit
        ? parseInt(req.query.limit as string, 10)
        : 8;
      const related = await storage.getRelatedProducts(productId, limit);
      res.json(related);
    } catch (error) {
      console.error("Get related products error:", error);
      res.status(500).json({ error: "Failed to fetch related products" });
    }
  });

  app.get("/api/products/:id/purchased", requireAuth, async (req, res) => {
    try {
      const productId = req.params.id as string;
      const userId = req.session.userId!;
      const purchased = await storage.hasUserPurchasedProduct(
        userId,
        productId,
      );
      res.json({ purchased });
    } catch (error) {
      res.status(500).json({ error: "Failed to check purchase status" });
    }
  });

  app.post("/api/products/:id/reviews", requireAuth, async (req, res) => {
    try {
      const productId = req.params.id as string;
      const userId = req.session.userId!;

      const hasPurchased = await storage.hasUserPurchasedProduct(
        userId,
        productId,
      );
      if (!hasPurchased) {
        return res
          .status(400)
          .json({ error: "You can only review products you have purchased" });
      }

      const existing = await storage.getUserReviewForProduct(userId, productId);
      if (existing) {
        return res
          .status(400)
          .json({ error: "You have already reviewed this product" });
      }

      const reviewSchema = insertReviewSchema.pick({
        rating: true,
        comment: true,
      });
      const { rating, comment } = reviewSchema.parse(req.body);

      if (rating < 1 || rating > 5) {
        return res
          .status(400)
          .json({ error: "Rating must be between 1 and 5" });
      }

      const review = await storage.createReview({
        productId,
        userId,
        rating,
        comment,
      });
      res.json(review);
    } catch (error) {
      console.error("Create review error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: "Failed to create review" });
    }
  });

  app.patch("/api/reviews/:id", requireAuth, async (req, res) => {
    try {
      const reviewId = req.params.id as string;
      const userId = req.session.userId!;

      const existing = await storage.getReview(reviewId);
      if (!existing || existing.userId !== userId) {
        return res
          .status(403)
          .json({ error: "Not authorized to edit this review" });
      }

      const reviewSchema = insertReviewSchema
        .pick({ rating: true, comment: true })
        .partial();
      const data = reviewSchema.parse(req.body);

      if (data.rating !== undefined && (data.rating < 1 || data.rating > 5)) {
        return res
          .status(400)
          .json({ error: "Rating must be between 1 and 5" });
      }

      const review = await storage.updateReview(reviewId, data);
      res.json(review);
    } catch (error) {
      console.error("Update review error:", error);
      res.status(500).json({ error: "Failed to update review" });
    }
  });

  app.delete("/api/reviews/:id", requireAuth, async (req, res) => {
    try {
      const reviewId = req.params.id as string;
      const userId = req.session.userId!;
      const user = await storage.getUser(userId);

      const existing = await storage.getReview(reviewId);

      if (!existing) {
        return res.status(404).json({ error: "Review not found" });
      }

      if (
        existing.userId !== userId &&
        user?.role !== "admin" &&
        user?.role !== "superadmin"
      ) {
        return res
          .status(403)
          .json({ error: "Not authorized to delete this review" });
      }

      await storage.deleteReview(reviewId);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete review error:", error);
      res.status(500).json({ error: "Failed to delete review" });
    }
  });

  // Wishlist routes
  app.get("/api/wishlist", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 12;
      const search = req.query.search as string | undefined;

      const result = await storage.getWishlistItems(
        userId,
        page,
        limit,
        search,
      );
      res.json(result);
    } catch (error) {
      console.error("Get wishlist items error:", error);
      res.status(500).json({ error: "Failed to fetch wishlist items" });
    }
  });

  app.post("/api/wishlist", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const { productId } = req.body;

      if (!productId) {
        return res.status(400).json({ error: "Product ID is required" });
      }

      // Check if product exists
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      const item = await storage.addWishlistItem({ userId, productId });
      res.json(item);
    } catch (error) {
      console.error("Add to wishlist error:", error);
      res.status(500).json({ error: "Failed to add to wishlist" });
    }
  });

  app.delete("/api/wishlist/:productId", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const productId = req.params.productId as string;

      await storage.removeWishlistItem(userId, productId);
      res.json({ success: true });
    } catch (error) {
      console.error("Remove from wishlist error:", error);
      res.status(500).json({ error: "Failed to remove from wishlist" });
    }
  });

  app.get("/api/wishlist/check/:productId", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const productId = req.params.productId as string;

      const isInWishlist = await storage.isProductInWishlist(userId, productId);
      res.json({ isInWishlist });
    } catch (error) {
      console.error("Check wishlist error:", error);
      res.status(500).json({ error: "Failed to check wishlist" });
    }
  });

  app.get("/api/wishlist/product-ids", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const productIds = await storage.getWishlistProductIds(userId);
      res.json(productIds);
    } catch (error) {
      console.error("Get wishlist product IDs error:", error);
      res.status(500).json({ error: "Failed to fetch wishlist product IDs" });
    }
  });

  // Address routes
  app.get("/api/address", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const addresses = await storage.getUserAddresses(userId);
      res.json(addresses);
    } catch (error) {
      console.error("Get addresses error:", error);
      res.status(500).json({ error: "Failed to fetch addresses" });
    }
  });

  app.get("/api/address/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const addressId = req.params.id as string;

      const address = await storage.getAddress(addressId);

      if (!address) {
        return res.status(404).json({ error: "Address not found" });
      }

      // Verify ownership
      if (address.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      res.json(address);
    } catch (error) {
      console.error("Get address error:", error);
      res.status(500).json({ error: "Failed to fetch address" });
    }
  });

  app.post("/api/address", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;

      // Parse and validate the address data
      const addressData = insertAddressSchema.parse({
        ...req.body,
        userId, // Always use authenticated user's ID
      });

      const address = await storage.createAddress(addressData);
      res.json(address);
    } catch (error) {
      console.error("Create address error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          errors: error.errors.reduce(
            (acc, err) => {
              acc[err.path.join(".")] = err.message;
              return acc;
            },
            {} as Record<string, string>,
          ),
        });
      }
      res.status(500).json({ error: "Failed to create address" });
    }
  });

  app.put("/api/address/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const addressId = req.params.id as string;

      // Check if address exists and belongs to user
      const existing = await storage.getAddress(addressId);

      if (!existing) {
        return res.status(404).json({ error: "Address not found" });
      }

      if (existing.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      // Validate update data
      const partialSchema = insertAddressSchema
        .partial()
        .omit({ userId: true });
      const updateData = partialSchema.parse(req.body);

      const updated = await storage.updateAddress(addressId, updateData);
      res.json(updated);
    } catch (error) {
      console.error("Update address error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          errors: error.errors.reduce(
            (acc, err) => {
              acc[err.path.join(".")] = err.message;
              return acc;
            },
            {} as Record<string, string>,
          ),
        });
      }
      res.status(500).json({ error: "Failed to update address" });
    }
  });

  app.delete("/api/address/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const addressId = req.params.id as string;

      // Check if address exists and belongs to user
      const existing = await storage.getAddress(addressId);

      if (!existing) {
        return res.status(404).json({ error: "Address not found" });
      }

      if (existing.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      await storage.deleteAddress(addressId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete address error:", error);
      res.status(500).json({ error: "Failed to delete address" });
    }
  });

  app.patch("/api/address/default/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const addressId = req.params.id as string;

      // Check if address exists and belongs to user
      const existing = await storage.getAddress(addressId);

      if (!existing) {
        return res.status(404).json({ error: "Address not found" });
      }

      if (existing.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      await storage.setDefaultAddress(addressId, userId);

      // Return updated addresses list
      const addresses = await storage.getUserAddresses(userId);
      res.json(addresses);
    } catch (error) {
      console.error("Set default address error:", error);
      res.status(500).json({ error: "Failed to set default address" });
    }
  });

  // Location/Geo API proxy routes (to avoid CORS issues)
  app.get("/api/locations/countries", async (req, res) => {
    try {
      const response = await fetch(
        "https://cdn.geo-locations.com/countries.json",
      );
      if (!response.ok) {
        throw new Error("Failed to fetch countries");
      }
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Fetch countries error:", error);
      res.status(500).json({ error: "Failed to fetch countries" });
    }
  });

  app.get("/api/locations/states/:countryCode", async (req, res) => {
    try {
      const countryCode = req.params.countryCode as string;

      // Validate country code format (2 letters)
      if (!/^[A-Z]{2}$/i.test(countryCode)) {
        return res.status(400).json({ error: "Invalid country code" });
      }

      const response = await fetch(
        `https://cdn.geo-locations.com/locations/${countryCode.toUpperCase()}.json`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch states");
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Fetch states error:", error);
      res.status(500).json({ error: "Failed to fetch states" });
    }
  });

  app.post("/api/admin/products", requireAdmin, async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error) {
      console.error("Create product error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.patch("/api/admin/products/:id", requireAdmin, async (req, res) => {
    try {
      const id = req.params.id as string;
      // Validate the partial product data
      const partialProductSchema = insertProductSchema.partial();
      const productData = partialProductSchema.parse(req.body);
      const product = await storage.updateProduct(id, productData);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Update product error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/admin/products/:id", requireAdmin, async (req, res) => {
    try {
      const id = req.params.id as string;
      // Check if product exists before deletion
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      await storage.deleteProduct(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete product error:", error);
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  app.get("/api/orders/my-orders", requireAuth, async (req, res) => {
    try {
      const statusFilter = req.query.status as string | undefined;
      const orders = await storage.getUserOrders(
        req.session.userId!,
        statusFilter,
      );
      res.json(orders);
    } catch (error) {
      console.error("Get user orders error:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", requireAuth, async (req, res) => {
    try {
      const id = req.params.id as string;
      const order = await storage.getOrder(id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      const user = await storage.getUser(req.session.userId!);
      if (order.userId !== req.session.userId && user?.role === "customer") {
        return res.status(403).json({ error: "Forbidden" });
      }
      res.json(order);
    } catch (error) {
      console.error("Get order error:", error);
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  app.patch("/api/orders/:id/cancel", requireAuth, async (req, res) => {
    try {
      const id = req.params.id as string;
      const order = await storage.getOrder(id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      if (order.userId !== req.session.userId) {
        return res.status(403).json({ error: "Forbidden" });
      }
      if (order.status !== "pending") {
        return res
          .status(400)
          .json({ error: "Only pending orders can be cancelled" });
      }
      const reason = req.body?.reason || null;
      const updated = await storage.updateOrderStatus(id, "cancelled", reason);
      res.json(updated);
    } catch (error) {
      console.error("Cancel order error:", error);
      res.status(500).json({ error: "Failed to cancel order" });
    }
  });

  app.patch("/api/orders/:id/return", requireAuth, async (req, res) => {
    try {
      const id = req.params.id as string;
      const order = await storage.getOrder(id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      if (order.userId !== req.session.userId) {
        return res.status(403).json({ error: "Forbidden" });
      }
      if (order.status !== "delivered") {
        return res.status(400).json({ error: "Only delivered orders can be returned" });
      }
      const deliveredAt = new Date(order.updatedAt);
      const daysSinceDelivery = (Date.now() - deliveredAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceDelivery > 7) {
        return res.status(400).json({
          error: "Return window has expired. Returns are only accepted within 7 days of delivery.",
        });
      }
      const { reason } = req.body;
      if (!reason) {
        return res.status(400).json({ error: "Return reason is required" });
      }
      const updated = await storage.requestReturn(id, reason);
      res.json(updated);
    } catch (error) {
      console.error("Return order error:", error);
      res.status(500).json({ error: "Failed to submit return request" });
    }
  });

  app.post("/api/orders", requireAuth, async (req, res) => {
    try {
      const {
        items,
        totalAmount,
        addressId,
        shippingName,
        shippingPhone,
        shippingAddress,
        shippingCity,
        shippingEmirate,
      } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Order items are required" });
      }

      if (!addressId) {
        return res.status(400).json({ error: "Delivery address is required" });
      }

      if (
        !shippingName ||
        !shippingPhone ||
        !shippingAddress ||
        !shippingCity ||
        !shippingEmirate
      ) {
        return res
          .status(400)
          .json({ error: "All shipping fields are required" });
      }

      if (!totalAmount || isNaN(parseFloat(totalAmount))) {
        return res.status(400).json({ error: "Invalid total amount" });
      }

      // COD orders are created immediately and are valid for admin processing
      const order = await storage.createOrder({
        userId: req.session.userId!,
        addressId: addressId || null,
        totalAmount,
        shippingName,
        shippingPhone,
        shippingAddress,
        shippingCity,
        shippingEmirate,
        status: "pending",
        paymentMethod: "cod",
        paymentStatus: "pending",
      });

      for (const item of items) {
        const product = await storage.getProduct(item.productId);
        if (product) {
          // Calculate discounted price - customers pay the discounted price, not original
          const originalPrice = parseFloat(product.price);
          const discountPercent = product.discountPercent || 0;
          const discountedPrice =
            discountPercent > 0
              ? originalPrice * (1 - discountPercent / 100)
              : originalPrice;

          await storage.createOrderItem({
            orderId: order.id,
            productId: item.productId,
            productName: product.name,
            productPrice: discountedPrice.toFixed(2), // Store discounted price
            quantity: item.quantity,
          });
          await storage.updateProduct(product.id, {
            stock: Math.max(0, product.stock - item.quantity),
          });
        }
      }

      await storage.clearCart(req.session.userId!);

      const fullOrder = await storage.getOrder(order.id);
      res.json(fullOrder);
    } catch (error) {
      console.error("Create order error:", error);
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  app.get("/api/orders/:id/invoice", requireAuth, async (req, res) => {
    try {
      const id = req.params.id as string;
      const order = await storage.getOrder(id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      if (order.status === ("cancelled" as OrderStatus)) {
        return res
          .status(400)
          .json({ error: "Cannot generate invoice for cancelled orders" });
      }
      const user = await storage.getUser(req.session.userId!);
      if (order.userId !== req.session.userId && user?.role === "customer") {
        return res.status(403).json({ error: "Forbidden" });
      }

      console.log(`Generating invoice for order ${order.orderNumber}`);

      // Generate PDF
      const { generateInvoicePDF } = await import("./utils.js");
      const pdfBuffer = await generateInvoicePDF(order, user!);

      console.log(
        `PDF generated successfully, size: ${pdfBuffer.length} bytes`,
      );

      // Set headers for PDF download
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="Invoice-${order.orderNumber}.pdf"`,
      );
      res.setHeader("Content-Length", pdfBuffer.length.toString());
      res.setHeader("Cache-Control", "no-cache");

      // Use end() for binary data instead of send()
      res.end(pdfBuffer, "binary");
    } catch (error) {
      console.error("Get invoice error:", error);
      res
        .status(500)
        .json({
          error: "Failed to generate invoice",
          message: error instanceof Error ? error.message : "Unknown error",
        });
    }
  });

  app.get("/api/admin/orders", requireAdmin, async (req, res) => {
    try {
      const orders = await storage.getAllOrders();

      // Annotate unpaid Stripe orders to prevent processing them as COD
      const annotatedOrders = orders.map((order) => ({
        ...order,
        isAwaitingPayment:
          order.paymentMethod === ("stripe" as PaymentMethod) &&
          order.paymentStatus !== ("paid" as PaymentStatus),
      }));

      res.json(annotatedOrders);
    } catch (error) {
      console.error("Get all orders error:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.patch("/api/admin/orders/:id/status", requireAdmin, async (req, res) => {
    try {
      const id = req.params.id as string;
      const { status } = req.body;

      // Get the order first to check payment status
      const existingOrder = await storage.getOrder(id);

      if (!existingOrder) {
        return res.status(404).json({ error: "Order not found" });
      }

      // Validate requested status transition using centralized rules
      console.log(`Attempting to change order ${existingOrder.orderNumber} from ${existingOrder.status} to ${status}`);
      const nextStatus = status as OrderStatus;
      if (!canTransitionOrderStatus(existingOrder.status as OrderStatus, nextStatus)) {
        return res.status(400).json({ error: `Cannot change order from ${existingOrder.status} to ${nextStatus}` });
      }

      // Prevent processing unpaid Stripe orders
      if (
        existingOrder.paymentMethod === ("stripe" as PaymentMethod) &&
        existingOrder.paymentStatus !== ("paid" as PaymentStatus) &&
        status !== ("cancelled" as OrderStatus)
      ) {
        return res.status(400).json({
          error:
            "Cannot process unpaid Stripe order. Payment must be completed first or order should be cancelled.",
          isAwaitingPayment: true,
        });
      }

      const order = await storage.updateOrderStatus(id, status);

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      // When marking as refunded, also update the payment status
      if (status === "refunded") {
        await storage.markOrderRefunded(id);
      }

      res.json(order);
    } catch (error) {
      console.error("Update order status error:", error);
      res.status(500).json({ error: "Failed to update order status" });
    }
  });

  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Get all users error:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post(
    "/api/admin/users/create-admin",
    requireSuperAdmin,
    async (req, res) => {
      try {
        const { email } = req.body;
        if (!email) {
          return res.status(400).json({ error: "Email is required" });
        }

        const normalizedEmail = email.toLowerCase().trim();
        let user = await storage.getUserByEmail(normalizedEmail);
        if (user) {
          if (user.role === "admin") {
            return res.status(400).json({ error: "User is already an admin" });
          } else {
            user = await storage.updateUser(user.id, {
              role: "admin",
              isRegistered: true,
            });
          }
        }
        else {
          user = await storage.createUser({
            email: normalizedEmail,
            role: "admin",
            isRegistered: true,
          });
        }

        res.json(user);
      } catch (error) {
        console.error("Create admin error:", error);
        res.status(500).json({ error: "Failed to create admin" });
      }
    },
  );

  app.patch(
    "/api/admin/users/:id/role",
    requireSuperAdmin,
    async (req, res) => {
      try {
        const id = req.params.id as string;
        const { role } = req.body;
        const userToUpdate = await storage.getUser(id);

        if (!userToUpdate) {
          return res.status(404).json({ error: "User not found" });
        }

        if (userToUpdate.email === SUPER_ADMIN_EMAIL) {
          return res.status(403).json({ error: "Cannot modify super admin" });
        }

        const user = await storage.updateUser(id, { role });
        res.json(user);
      } catch (error) {
        console.error("Update user role error:", error);
        res.status(500).json({ error: "Failed to update user role" });
      }
    },
  );

  app.delete("/api/admin/users/:id", requireSuperAdmin, async (req, res) => {
    try {
      const id = req.params.id as string;
      const userToDelete = await storage.getUser(id);

      if (!userToDelete) {
        return res.status(404).json({ error: "User not found" });
      }

      if (userToDelete.email === SUPER_ADMIN_EMAIL) {
        return res.status(403).json({ error: "Cannot delete super admin" });
      }

      await storage.deleteUser(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  app.patch("/api/users/profile", requireAuth, async (req, res) => {
    try {
      const { name, countryId, phoneNumber } = req.body;

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;

      // If updating phone, validate country and phone number
      if (countryId !== undefined || phoneNumber !== undefined) {
        const finalCountryId =
          countryId || (await storage.getUser(req.session.userId!))?.countryId;
        const finalPhoneNumber =
          phoneNumber !== undefined
            ? phoneNumber
            : (await storage.getUser(req.session.userId!))?.phoneNumber;

        if (!finalCountryId || !finalPhoneNumber) {
          return res
            .status(400)
            .json({ error: "Country and phone number are required" });
        }

        // Validate country exists
        const country = await storage.getSupportedCountry(finalCountryId);
        if (!country) {
          return res.status(400).json({ error: "Invalid country selected" });
        }

        // Validate phone number format (only digits)
        if (!/^\d+$/.test(finalPhoneNumber)) {
          return res
            .status(400)
            .json({ error: "Phone number must contain only digits" });
        }

        // Validate phone number length
        if (finalPhoneNumber.length !== country.phoneLength) {
          return res.status(400).json({
            error: `Phone number must be ${country.phoneLength} digits for ${country.name}`,
          });
        }

        updateData.countryId = finalCountryId;
        updateData.phoneNumber = finalPhoneNumber;
      }

      const user = await storage.updateUser(req.session.userId!, updateData);
      res.json(user);
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Stripe Routes
  app.get("/api/stripe/publishable-key", (req, res) => {
    try {
      const publishableKey = getStripePublishableKey();
      res.json({ publishableKey });
    } catch (error) {
      console.error("Get Stripe publishable key error:", error);
      res.status(500).json({ error: "Failed to get Stripe key" });
    }
  });

  app.post(
    "/api/stripe/create-checkout-session",
    requireAuth,
    async (req, res) => {
      try {
        const {
          items,
          addressId,
          shippingName,
          shippingPhone,
          shippingAddress,
          shippingCity,
          shippingEmirate,
        } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
          return res.status(400).json({ error: "Cart items are required" });
        }

        if (!addressId) {
          return res
            .status(400)
            .json({ error: "Delivery address is required" });
        }

        if (
          !shippingName ||
          !shippingPhone ||
          !shippingAddress ||
          !shippingCity ||
          !shippingEmirate
        ) {
          return res
            .status(400)
            .json({ error: "All shipping fields are required" });
        }

        const stripe = getStripeClient();
        const user = await storage.getUser(req.session.userId!);

        if (!user) {
          return res.status(401).json({ error: "User not found" });
        }

        // Build line items with discounted prices - compute subtotal server-side
        const lineItems = [];
        const orderItemsSnapshot = []; // Store price snapshot for order creation
        let subtotal = 0;

        for (const item of items) {
          const product = await storage.getProduct(item.productId);
          if (!product) {
            return res
              .status(400)
              .json({ error: `Product ${item.productId} not found` });
          }
          if (item.quantity <= 0 || item.quantity > product.stock) {
            return res
              .status(400)
              .json({ error: `Invalid quantity for ${product.name}` });
          }

          const originalPrice = parseFloat(product.price);
          const discountPercent = product.discountPercent || 0;
          const discountedPrice =
            discountPercent > 0
              ? originalPrice * (1 - discountPercent / 100)
              : originalPrice;

          subtotal += discountedPrice * item.quantity;

          // Store snapshot of item with price at checkout time
          orderItemsSnapshot.push({
            productId: product.id,
            productName: product.name,
            productPrice: discountedPrice.toFixed(2),
            quantity: item.quantity,
          });

          lineItems.push({
            price_data: {
              currency: "aed",
              product_data: {
                name: product.name,
                description: product.description || undefined,
                images: product.imageUrl ? [product.imageUrl] : undefined,
              },
              unit_amount: Math.round(discountedPrice * 100), // Convert to fils
            },
            quantity: item.quantity,
          });
        }

        // Calculate shipping cost server-side based on computed subtotal
        const shippingCost = subtotal >= 200 ? 0 : 25;
        if (shippingCost > 0) {
          lineItems.push({
            price_data: {
              currency: "aed",
              product_data: {
                name: "Shipping",
                description: "Standard Delivery",
              },
              unit_amount: shippingCost * 100,
            },
            quantity: 1,
          });
        }

        const totalAmount = subtotal + shippingCost;

        // Check if user has an existing unpaid Stripe order
        // This prevents duplicate orders when user cancels and retries payment
        let pendingOrder = await storage.findUnpaidStripeOrder(
          req.session.userId!,
        );

        if (pendingOrder) {
          console.log(
            "Reusing existing unpaid order:",
            pendingOrder.id,
            "Order #:",
            pendingOrder.orderNumber,
          );

          // Validate the order details match (optional but recommended)
          const orderTotal = parseFloat(pendingOrder.totalAmount);
          if (Math.abs(orderTotal - totalAmount) > 0.01) {
            console.log("Order total changed, creating new order instead");
            pendingOrder = undefined;
          }
        }

        // Create new pending order only if no existing unpaid order found
        if (!pendingOrder) {
          pendingOrder = await storage.createPendingOrder({
            userId: req.session.userId!,
            addressId: addressId || null,
            items: orderItemsSnapshot,
            subtotal: subtotal.toFixed(2),
            shippingCost: shippingCost.toFixed(2),
            totalAmount: totalAmount.toFixed(2),
            shippingName,
            shippingPhone,
            shippingAddress,
            shippingCity,
            shippingEmirate,
          });

          console.log(
            "Created new pending order:",
            pendingOrder.id,
            "Order #:",
            pendingOrder.orderNumber,
          );
        }

        // Use APP_URL for Railway deployment, fallback to localhost for development
        const baseUrl =
          process.env.APP_URL || `http://localhost:${process.env.PORT || 5000}`;

        // Only store the orderId in metadata (small identifier, not business data)
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: lineItems,
          mode: "payment",
          success_url: `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${baseUrl}/dashboard/orders/${pendingOrder.id}`,
          customer_email: user.email,
          metadata: {
            orderId: pendingOrder.id, // ONLY store identifier - not full data
          },
        });

        // Update the order with the Stripe session ID
        await storage.updateOrderPaymentStatus(
          pendingOrder.id,
          "pending",
          session.id,
        );

        console.log(
          "Stripe session created:",
          session.id,
          "for order:",
          pendingOrder.id,
        );

        res.json({
          sessionId: session.id,
          url: session.url,
          orderId: pendingOrder.id,
          orderNumber: pendingOrder.orderNumber,
        });
      } catch (error: any) {
        console.error("Create checkout session error:", error);
        res.status(500).json({
          error: error.message || "Failed to create checkout session",
        });
      }
    },
  );

  // Retry payment for an existing unpaid Stripe order
  app.post(
    "/api/orders/:orderId/retry-payment",
    requireAuth,
    async (req, res) => {
      try {
        const orderId = req.params.orderId as string;

        // Get the order
        const order = await storage.getOrder(orderId);

        if (!order) {
          return res.status(404).json({ error: "Order not found" });
        }

        // Verify the order belongs to the current user
        if (order.userId !== req.session.userId) {
          return res.status(403).json({ error: "Unauthorized" });
        }

        // Ensure it's a Stripe order
        if (order.paymentMethod !== ("stripe" as PaymentMethod)) {
          return res
            .status(400)
            .json({ error: "This order is not a Stripe payment" });
        }

        // Ensure it's still pending
        if (order.paymentStatus !== ("pending" as PaymentStatus)) {
          return res
            .status(400)
            .json({ error: "This order has already been processed" });
        }

        const stripe = getStripeClient();
        const user = await storage.getUser(req.session.userId!);

        if (!user) {
          return res.status(401).json({ error: "User not found" });
        }

        // Build line items from existing order items
        const lineItems = [];

        for (const item of order.orderItems) {
          const price = parseFloat(item.productPrice);
          lineItems.push({
            price_data: {
              currency: "aed",
              product_data: {
                name: item.productName,
              },
              unit_amount: Math.round(price * 100),
            },
            quantity: item.quantity,
          });
        }

        const baseUrl =
          process.env.APP_URL || `http://localhost:${process.env.PORT || 5000}`;

        // Create new Stripe session for the existing order
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: lineItems,
          mode: "payment",
          success_url: `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${baseUrl}/dashboard/orders/${order.id}`,
          customer_email: user.email,
          metadata: {
            orderId: order.id,
          },
        });

        // Update the order with the new Stripe session ID
        await storage.updateOrderPaymentStatus(order.id, "pending", session.id);

        console.log(
          "Retry payment - new Stripe session:",
          session.id,
          "for order:",
          order.id,
        );

        res.json({
          sessionId: session.id,
          url: session.url,
          orderId: order.id,
          orderNumber: order.orderNumber,
        });
      } catch (error: any) {
        console.error("Retry payment error:", error);
        res.status(500).json({
          error: error.message || "Failed to retry payment",
        });
      }
    },
  );

  // Simplified verify-payment endpoint - just retrieves the order
  // Payment verification is now handled by webhooks
  app.post("/api/stripe/verify-payment", requireAuth, async (req, res) => {
    try {
      const { sessionId } = req.body;

      if (!sessionId) {
        return res.status(400).json({ error: "Session ID required" });
      }

      // Find order by stripe session ID
      const order = await storage.getOrderByStripeSession(sessionId);

      if (!order) {
        return res
          .status(404)
          .json({ error: "Order not found for this session" });
      }

      // Verify the order belongs to the current user
      if (order.userId !== req.session.userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // Get full order details
      const fullOrder = await storage.getOrder(order.id);

      res.json({
        order: fullOrder,
        alreadyProcessed: order.paymentStatus === ("paid" as PaymentStatus),
      });
    } catch (error: any) {
      console.error("Verify payment error:", error);
      res
        .status(500)
        .json({ error: error.message || "Failed to verify payment" });
    }
  });

  return httpServer;
}

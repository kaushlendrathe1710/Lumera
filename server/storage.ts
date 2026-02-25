import {
  users, products, cartItems, orders, orderItems, otpTokens, reviews, categories, supportedCountries, wishlistItems, addresses,
  type User, type InsertUser, type Product, type InsertProduct,
  type CartItem, type InsertCartItem, type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem, type OtpToken, type InsertOtpToken,
  type CartItemWithProduct, type OrderWithItems, type Review, type InsertReview, type ReviewWithUser,
  type Category, type InsertCategory, type SupportedCountry, type InsertSupportedCountry,
  type ProductWithCategory, type WishlistItem, type InsertWishlistItem, type WishlistItemWithProduct,
  type Address, type InsertAddress,
  type OrderStatus, type PaymentStatus, type PaymentMethod
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, ne, desc, gt, avg, count, like, sql, ilike } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<void>;
  getAllUsers(): Promise<User[]>;

  getSupportedCountry(id: string): Promise<SupportedCountry | undefined>;
  getSupportedCountryByIsoCode(isoCode: string): Promise<SupportedCountry | undefined>;
  getAllSupportedCountries(): Promise<SupportedCountry[]>;
  createSupportedCountry(country: InsertSupportedCountry): Promise<SupportedCountry>;
  updateSupportedCountry(id: string, data: Partial<InsertSupportedCountry>): Promise<SupportedCountry | undefined>;
  deleteSupportedCountry(id: string): Promise<void>;

  getCategory(id: string): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  getAllCategories(): Promise<Category[]>;
  getActiveCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, data: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<void>;

  getProduct(id: string): Promise<ProductWithCategory | undefined>;
  getAllProducts(): Promise<Product[]>;
  getRelatedProducts(productId: string, limit?: number): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, data: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<void>;

  getCartItems(userId: string): Promise<CartItemWithProduct[]>;
  addCartItem(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: string, quantity: number): Promise<CartItem | undefined>;
  removeCartItem(id: string): Promise<void>;
  clearCart(userId: string): Promise<void>;

  getOrder(id: string): Promise<OrderWithItems | undefined>;
  getOrderByStripeSession(sessionId: string): Promise<Order | undefined>;
  findUnpaidStripeOrder(userId: string): Promise<Order | undefined>;
  getUserOrders(userId: string, statusFilter?: string): Promise<OrderWithItems[]>;
  getAllOrders(): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  createPendingOrder(orderData: {
    userId: string;
    addressId?: string | null;
    items: Array<{ productId: string; productName: string; productPrice: string; quantity: number }>;
    subtotal: string;
    shippingCost: string;
    totalAmount: string;
    shippingName: string;
    shippingPhone: string;
    shippingAddress: string;
    shippingCity: string;
    shippingEmirate: string;
  }): Promise<Order>;
  updateOrderStatus(id: string, status: OrderStatus, cancellationReason?: string | null): Promise<Order | undefined>;
  requestReturn(id: string, reason: string): Promise<Order | undefined>;
  markOrderRefunded(id: string): Promise<Order | undefined>;
  updateOrderPaymentStatus(
    orderId: string,
    paymentStatus: PaymentStatus,
    stripeSessionId?: string,
    stripePaymentIntentId?: string
  ): Promise<Order | undefined>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;
  getOrderItems(orderId: string): Promise<OrderItem[]>;

  createOtpToken(token: InsertOtpToken): Promise<OtpToken>;
  getValidOtpToken(email: string, otp: string): Promise<OtpToken | undefined>;
  deleteOtpTokens(email: string): Promise<void>;

  hasUserPurchasedProduct(userId: string, productId: string): Promise<boolean>;
  getReview(id: string): Promise<Review | undefined>;
  getProductReviews(productId: string): Promise<ReviewWithUser[]>;
  getUserReviewForProduct(userId: string, productId: string): Promise<Review | undefined>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: string, data: Partial<InsertReview>): Promise<Review | undefined>;
  deleteReview(id: string): Promise<void>;
  getProductRatingSummary(productId: string): Promise<{ avgRating: number; reviewCount: number }>;
  getAllProductRatings(): Promise<{ productId: string; avgRating: number; reviewCount: number }[]>;

  // Wishlist methods
  getWishlistItems(userId: string, page?: number, limit?: number, search?: string): Promise<{ items: WishlistItemWithProduct[], total: number }>;
  addWishlistItem(item: InsertWishlistItem): Promise<WishlistItem>;
  removeWishlistItem(userId: string, productId: string): Promise<void>;
  isProductInWishlist(userId: string, productId: string): Promise<boolean>;
  getWishlistProductIds(userId: string): Promise<string[]>;

  // Address methods
  getUserAddresses(userId: string): Promise<Address[]>;
  getAddress(id: string): Promise<Address | undefined>;
  getDefaultAddress(userId: string): Promise<Address | undefined>;
  createAddress(address: InsertAddress): Promise<Address>;
  updateAddress(id: string, data: Partial<InsertAddress>): Promise<Address | undefined>;
  deleteAddress(id: string, userId: string): Promise<void>;
  setDefaultAddress(addressId: string, userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
      with: { country: true },
    });
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
      with: { country: true },
    });
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getAllUsers(): Promise<User[]> {
    const usersWithCountry = await db.query.users.findMany({
      orderBy: [desc(users.createdAt)],
      with: { country: true },
    });
    return usersWithCountry as User[];
  }

  async getSupportedCountry(id: string): Promise<SupportedCountry | undefined> {
    const [country] = await db.select().from(supportedCountries).where(eq(supportedCountries.id, id));
    return country || undefined;
  }

  async getSupportedCountryByIsoCode(isoCode: string): Promise<SupportedCountry | undefined> {
    const [country] = await db.select().from(supportedCountries).where(eq(supportedCountries.isoCode, isoCode.toUpperCase()));
    return country || undefined;
  }

  async getAllSupportedCountries(): Promise<SupportedCountry[]> {
    return db.select().from(supportedCountries).orderBy(supportedCountries.name);
  }

  async createSupportedCountry(insertCountry: InsertSupportedCountry): Promise<SupportedCountry> {
    const [country] = await db.insert(supportedCountries).values({
      ...insertCountry,
      isoCode: insertCountry.isoCode.toUpperCase(),
    }).returning();
    return country;
  }

  async updateSupportedCountry(id: string, data: Partial<InsertSupportedCountry>): Promise<SupportedCountry | undefined> {
    const updateData = data.isoCode ? { ...data, isoCode: data.isoCode.toUpperCase() } : data;
    const [country] = await db.update(supportedCountries).set(updateData).where(eq(supportedCountries.id, id)).returning();
    return country || undefined;
  }

  async deleteSupportedCountry(id: string): Promise<void> {
    await db.delete(supportedCountries).where(eq(supportedCountries.id, id));
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category || undefined;
  }

  async getAllCategories(): Promise<Category[]> {
    return db.select().from(categories).orderBy(desc(categories.createdAt));
  }

  async getActiveCategories(): Promise<Category[]> {
    return db.select().from(categories).where(eq(categories.isActive, true)).orderBy(categories.name);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }

  async updateCategory(id: string, data: Partial<InsertCategory>): Promise<Category | undefined> {
    const [category] = await db.update(categories).set(data).where(eq(categories.id, id)).returning();
    return category || undefined;
  }

  async deleteCategory(id: string): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  async getProduct(id: string): Promise<ProductWithCategory | undefined> {
    const product = await db.query.products.findFirst({
      where: eq(products.id, id),
      with: { category: true },
    });
    return product || undefined;
  }

  async getRelatedProducts(productId: string, limit = 8): Promise<Product[]> {
    // Find the product first to get category
    const product = await this.getProduct(productId);
    if (!product || !product.category) return [];

    const related = await db.query.products.findMany({
      where: and(eq(products.categoryId, product.category.id), ne(products.id, productId)),
      orderBy: [desc(products.createdAt)],
      with: { category: true },
      limit,
    });

    return related as Product[];
  }

  async getAllProducts(): Promise<Product[]> {
    const productsWithCategory = await db.query.products.findMany({
      orderBy: [desc(products.createdAt)],
      with: { category: true },
    });
    return productsWithCategory as Product[];
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async updateProduct(id: string, data: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await db.update(products).set(data).where(eq(products.id, id)).returning();
    return product || undefined;
  }

  async deleteProduct(id: string): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async getCartItems(userId: string): Promise<CartItemWithProduct[]> {
    const items = await db.query.cartItems.findMany({
      where: eq(cartItems.userId, userId),
      with: {
        product: {
          with: { category: true },
        },
      },
    });
    return items as CartItemWithProduct[];
  }

  async addCartItem(item: InsertCartItem): Promise<CartItem> {
    const [existing] = await db.select().from(cartItems)
      .where(and(eq(cartItems.userId, item.userId), eq(cartItems.productId, item.productId)));

    if (existing) {
      const [updated] = await db.update(cartItems)
        .set({ quantity: existing.quantity + (item.quantity || 1) })
        .where(eq(cartItems.id, existing.id))
        .returning();
      return updated;
    }

    const [cartItem] = await db.insert(cartItems).values(item).returning();
    return cartItem;
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem | undefined> {
    const [item] = await db.update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return item || undefined;
  }

  async removeCartItem(id: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  async getOrder(id: string): Promise<OrderWithItems | undefined> {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, id),
      with: {
        address: true,
        orderItems: {
          with: { product: true },
        },
      },
    });
    return order as OrderWithItems | undefined;
  }

  async getOrderByStripeSession(sessionId: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders)
      .where(eq(orders.stripeSessionId, sessionId));
    return order || undefined;
  }

  async findUnpaidStripeOrder(userId: string): Promise<Order | undefined> {
    // Find the most recent unpaid Stripe order for this user
    const [order] = await db.select().from(orders)
      .where(and(
        eq(orders.userId, userId),
        eq(orders.paymentMethod, 'stripe'),
        eq(orders.paymentStatus, 'pending')
      ))
      .orderBy(desc(orders.createdAt))
      .limit(1);
    return order || undefined;
  }

  async getUserOrders(userId: string, statusFilter?: string): Promise<OrderWithItems[]> {
    const conditions = [eq(orders.userId, userId)];

    if (statusFilter) {
      if (statusFilter === "returns") {
        conditions.push(sql`${orders.status} IN ('returning', 'returned', 'refunded')`);
      } else {
        conditions.push(eq(orders.status, statusFilter as any));
      }
    }

    const ordersWithItems = await db.query.orders.findMany({
      where: and(...conditions),
      orderBy: [desc(orders.createdAt)],
      with: {
        address: true,
        orderItems: {
          with: { product: true },
        },
      },
    });
    return ordersWithItems as OrderWithItems[];
  }

  async getAllOrders(): Promise<Order[]> {
    const allOrders = await db.query.orders.findMany({
      orderBy: [desc(orders.createdAt)],
      with: {
        address: true,
      },
    });
    return allOrders as Order[];
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const orderNumber = `GH-${Date.now().toString(36).toUpperCase()}`;
    const [order] = await db.insert(orders)
      .values({ ...insertOrder, orderNumber })
      .returning();
    return order;
  }

  async createPendingOrder(orderData: {
    userId: string;
    addressId?: string | null;
    items: Array<{ productId: string; productName: string; productPrice: string; quantity: number }>;
    subtotal: string;
    shippingCost: string;
    totalAmount: string;
    shippingName: string;
    shippingPhone: string;
    shippingAddress: string;
    shippingCity: string;
    shippingEmirate: string;
  }): Promise<Order> {
    const orderNumber = `GH-${Date.now().toString(36).toUpperCase()}`;

    // Create the order with pending status and stripe payment method
    // This order should NOT be processed by admin until paid
    const [order] = await db.insert(orders)
      .values({
        orderNumber,
        userId: orderData.userId,
        addressId: orderData.addressId || null,
        totalAmount: orderData.totalAmount,
        shippingName: orderData.shippingName,
        shippingPhone: orderData.shippingPhone,
        shippingAddress: orderData.shippingAddress,
        shippingCity: orderData.shippingCity,
        shippingEmirate: orderData.shippingEmirate,
        status: 'pending',
        paymentMethod: 'stripe',
        paymentStatus: 'pending',
      })
      .returning();

    // Create order items with price snapshot
    for (const item of orderData.items) {
      await db.insert(orderItems).values({
        orderId: order.id,
        productId: item.productId,
        productName: item.productName,
        productPrice: item.productPrice,
        quantity: item.quantity,
      });
    }

    return order;
  }

  async updateOrderStatus(id: string, status: OrderStatus, cancellationReason?: string | null): Promise<Order | undefined> {
    const updateData: any = { status: status as any, updatedAt: new Date() };
    if (cancellationReason !== undefined) {
      updateData.cancellationReason = cancellationReason;
    }
    const [order] = await db.update(orders)
      .set(updateData)
      .where(eq(orders.id, id))
      .returning();
    return order || undefined;
  }

  async requestReturn(id: string, reason: string): Promise<Order | undefined> {
    const [order] = await db.update(orders)
      .set({
        status: "returning" as OrderStatus,
        returnReason: reason,
        returnRequestedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id))
      .returning();
    return order || undefined;
  }

  async markOrderRefunded(id: string): Promise<Order | undefined> {
    const [order] = await db.update(orders)
      .set({ paymentStatus: "refunded" as PaymentStatus, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return order || undefined;
  }

  async updateOrderPaymentStatus(
    orderId: string,
    paymentStatus: PaymentStatus,
    stripeSessionId?: string,
    stripePaymentIntentId?: string
  ): Promise<Order | undefined> {
    const updateData: any = {
      paymentStatus,
      status: (paymentStatus === 'paid' ? 'processing' : 'pending') as OrderStatus,
      updatedAt: new Date(),
    };

    if (stripeSessionId) {
      updateData.stripeSessionId = stripeSessionId;
    }
    if (stripePaymentIntentId) {
      updateData.stripePaymentIntentId = stripePaymentIntentId;
    }

    const [order] = await db.update(orders)
      .set(updateData)
      .where(eq(orders.id, orderId))
      .returning();
    return order || undefined;
  }

  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const [orderItem] = await db.insert(orderItems).values(item).returning();
    return orderItem;
  }

  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async createOtpToken(token: InsertOtpToken): Promise<OtpToken> {
    await db.delete(otpTokens).where(eq(otpTokens.email, token.email));
    const [otpToken] = await db.insert(otpTokens).values(token).returning();
    return otpToken;
  }

  async getValidOtpToken(email: string, otp: string): Promise<OtpToken | undefined> {
    const [token] = await db.select().from(otpTokens)
      .where(and(
        eq(otpTokens.email, email),
        eq(otpTokens.otp, otp),
        gt(otpTokens.expiresAt, new Date())
      ));
    return token || undefined;
  }

  async deleteOtpTokens(email: string): Promise<void> {
    await db.delete(otpTokens).where(eq(otpTokens.email, email));
  }

  async hasUserPurchasedProduct(userId: string, productId: string): Promise<boolean> {
    const result = await db.select({ id: orderItems.id })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(and(eq(orders.userId, userId), eq(orderItems.productId, productId), ne(orders.status, "cancelled")))
      .limit(1);
    return result.length > 0;
  }

  async getReview(id: string): Promise<Review | undefined> {
    const [review] = await db.select().from(reviews).where(eq(reviews.id, id));
    return review || undefined;
  }

  async getProductReviews(productId: string): Promise<ReviewWithUser[]> {
    const result = await db.query.reviews.findMany({
      where: eq(reviews.productId, productId),
      with: { user: true },
      orderBy: [desc(reviews.createdAt)],
    });
    return result.map((r: any) => ({
      ...r,
      user: { id: r.user.id, name: r.user.name, email: r.user.email },
    }));
  }

  async getUserReviewForProduct(userId: string, productId: string): Promise<Review | undefined> {
    const [review] = await db.select().from(reviews)
      .where(and(eq(reviews.userId, userId), eq(reviews.productId, productId)));
    return review || undefined;
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [created] = await db.insert(reviews).values(review).returning();
    return created;
  }

  async updateReview(id: string, data: Partial<InsertReview>): Promise<Review | undefined> {
    const [updated] = await db.update(reviews).set(data).where(eq(reviews.id, id)).returning();
    return updated || undefined;
  }

  async deleteReview(id: string): Promise<void> {
    await db.delete(reviews).where(eq(reviews.id, id));
  }

  async getProductRatingSummary(productId: string): Promise<{ avgRating: number; reviewCount: number }> {
    const [result] = await db.select({
      avgRating: avg(reviews.rating),
      reviewCount: count(reviews.id),
    }).from(reviews).where(eq(reviews.productId, productId));
    return {
      avgRating: result?.avgRating ? parseFloat(result.avgRating as string) : 0,
      reviewCount: Number(result?.reviewCount || 0),
    };
  }

  async getAllProductRatings(): Promise<{ productId: string; avgRating: number; reviewCount: number }[]> {
    const result = await db.select({
      productId: reviews.productId,
      avgRating: avg(reviews.rating),
      reviewCount: count(reviews.id),
    }).from(reviews).groupBy(reviews.productId);
    return result.map(r => ({
      productId: r.productId,
      avgRating: r.avgRating ? parseFloat(r.avgRating as string) : 0,
      reviewCount: Number(r.reviewCount || 0),
    }));
  }

  // Wishlist methods
  async getWishlistItems(userId: string, page: number = 1, limit: number = 12, search?: string): Promise<{ items: WishlistItemWithProduct[], total: number }> {
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [eq(wishlistItems.userId, userId)];

    // If search is provided, add search conditions for product name or description
    if (search && search.trim() !== '') {
      const searchTerm = `%${search.trim()}%`;
      const searchCondition = or(
        ilike(products.name, searchTerm),
        ilike(products.description, searchTerm)
      );

      // Get wishlist items with search
      const items = await db.query.wishlistItems.findMany({
        where: eq(wishlistItems.userId, userId),
        with: {
          product: {
            with: {
              category: true,
            },
          },
        },
        orderBy: [desc(wishlistItems.createdAt)],
      });

      // Filter items based on product search
      const filteredItems = items.filter(item => {
        const productName = item.product?.name?.toLowerCase() || '';
        const productDesc = item.product?.description?.toLowerCase() || '';
        const searchLower = search.toLowerCase();
        return productName.includes(searchLower) || productDesc.includes(searchLower);
      });

      const total = filteredItems.length;
      const paginatedItems = filteredItems.slice(offset, offset + limit);

      return {
        items: paginatedItems as WishlistItemWithProduct[],
        total,
      };
    }

    // No search - get paginated results directly
    const items = await db.query.wishlistItems.findMany({
      where: eq(wishlistItems.userId, userId),
      with: {
        product: {
          with: {
            category: true,
          },
        },
      },
      orderBy: [desc(wishlistItems.createdAt)],
      limit,
      offset,
    });

    // Get total count
    const [{ count: totalCount }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(wishlistItems)
      .where(eq(wishlistItems.userId, userId));

    return {
      items: items as WishlistItemWithProduct[],
      total: totalCount,
    };
  }

  async addWishlistItem(item: InsertWishlistItem): Promise<WishlistItem> {
    // Check if item already exists
    const existing = await db.query.wishlistItems.findFirst({
      where: and(
        eq(wishlistItems.userId, item.userId),
        eq(wishlistItems.productId, item.productId)
      ),
    });

    if (existing) {
      return existing;
    }

    const [created] = await db.insert(wishlistItems).values(item).returning();
    return created;
  }

  async removeWishlistItem(userId: string, productId: string): Promise<void> {
    await db.delete(wishlistItems).where(
      and(
        eq(wishlistItems.userId, userId),
        eq(wishlistItems.productId, productId)
      )
    );
  }

  async isProductInWishlist(userId: string, productId: string): Promise<boolean> {
    const item = await db.query.wishlistItems.findFirst({
      where: and(
        eq(wishlistItems.userId, userId),
        eq(wishlistItems.productId, productId)
      ),
    });
    return !!item;
  }

  async getWishlistProductIds(userId: string): Promise<string[]> {
    const items = await db.select({ productId: wishlistItems.productId })
      .from(wishlistItems)
      .where(eq(wishlistItems.userId, userId));
    return items.map(item => item.productId);
  }

  // Address methods
  async getUserAddresses(userId: string): Promise<Address[]> {
    const userAddresses = await db
      .select()
      .from(addresses)
      .where(eq(addresses.userId, userId))
      .orderBy(desc(addresses.isDefault), desc(addresses.createdAt));
    return userAddresses;
  }

  async getAddress(id: string): Promise<Address | undefined> {
    const [address] = await db.select().from(addresses).where(eq(addresses.id, id));
    return address || undefined;
  }

  async getDefaultAddress(userId: string): Promise<Address | undefined> {
    const [address] = await db
      .select()
      .from(addresses)
      .where(and(eq(addresses.userId, userId), eq(addresses.isDefault, true)));
    return address || undefined;
  }

  async createAddress(address: InsertAddress): Promise<Address> {
    // If this is set as default, unset other defaults first
    if (address.isDefault) {
      await db
        .update(addresses)
        .set({ isDefault: false })
        .where(eq(addresses.userId, address.userId));
    }

    const [created] = await db.insert(addresses).values(address).returning();
    return created;
  }

  async updateAddress(id: string, data: Partial<InsertAddress>): Promise<Address | undefined> {
    // If setting as default, unset other defaults first
    if (data.isDefault) {
      const existing = await this.getAddress(id);
      if (existing) {
        await db
          .update(addresses)
          .set({ isDefault: false })
          .where(and(eq(addresses.userId, existing.userId), ne(addresses.id, id)));
      }
    }

    const [updated] = await db
      .update(addresses)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(addresses.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteAddress(id: string, userId: string): Promise<void> {
    const address = await this.getAddress(id);

    if (!address) {
      return;
    }

    // Delete the address
    await db.delete(addresses).where(eq(addresses.id, id));

    // If deleted address was default, set first remaining address as default
    if (address.isDefault) {
      const [firstAddress] = await db
        .select()
        .from(addresses)
        .where(eq(addresses.userId, userId))
        .limit(1);

      if (firstAddress) {
        await db
          .update(addresses)
          .set({ isDefault: true })
          .where(eq(addresses.id, firstAddress.id));
      }
    }
  }

  async setDefaultAddress(addressId: string, userId: string): Promise<void> {
    // Transaction: unset all defaults, then set the new one
    await db.transaction(async (tx) => {
      // Unset all defaults for this user
      await tx
        .update(addresses)
        .set({ isDefault: false })
        .where(eq(addresses.userId, userId));

      // Set the specified address as default
      await tx
        .update(addresses)
        .set({ isDefault: true, updatedAt: new Date() })
        .where(and(eq(addresses.id, addressId), eq(addresses.userId, userId)));
    });
  }
}

export const storage = new DatabaseStorage();

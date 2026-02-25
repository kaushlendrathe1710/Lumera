# Papa Honey - E-Commerce Website

## Overview
A complete e-commerce platform for selling premium honey products in the UAE. The website features passwordless email OTP authentication, role-based access control, shopping cart, checkout with Cash on Delivery, order management with invoices, and admin dashboards.

## Recent Changes
- Feb 8, 2026: Added product rating & review system
  - Reviews table with rating (1-5), comment, user/product references
  - One review per user per product enforcement
  - Star rating display on product detail, product listing, and home pages
  - Review form for authenticated customers
  - Admin/super admin can delete any review, customers can delete their own
  - Average rating and review count aggregation
- Feb 8, 2026: Fixed product image deletion not persisting in production
  - imageUrl and images fields now always sent in PATCH requests
- Feb 3, 2026: Added Stripe payment integration
  - Stripe Checkout for card payments
  - Cash on Delivery option retained
  - Payment success page with order verification
  - Customers pay discounted prices, not original prices
- Feb 3, 2026: Added AWS S3 integration for product image uploads
  - Presigned URL flow for secure direct uploads to S3
  - Admin-only authentication for upload endpoint
  - Public URLs for serving uploaded images
- Feb 3, 2026: Initial complete build
  - Database schema with users, products, orders, cart items, OTP tokens
  - Passwordless email OTP authentication via Nodemailer
  - Role-based access control (Customer, Admin, Super Admin)
  - Super admin protection for kaushlendrs.k12@fms.edu
  - Complete product catalog with search and filtering
  - Shopping cart with local storage persistence
  - Checkout flow with shipping details
  - Order management with invoice generation
  - Admin dashboard for products, orders, users
  - Customer dashboard for orders and profile
  - Honey-themed design with amber/gold color scheme

## Project Architecture

### Tech Stack
- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, Shadcn/ui
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Email OTP via Nodemailer, express-session

### Directory Structure
```
client/src/
├── pages/
│   ├── home.tsx              # Landing page with hero, featured products
│   ├── products.tsx          # Product catalog with search/filter
│   ├── product-detail.tsx    # Single product view
│   ├── cart.tsx              # Shopping cart
│   ├── checkout.tsx          # Checkout with shipping form
│   ├── login.tsx             # OTP authentication flow
│   ├── order-confirmation.tsx
│   ├── dashboard/            # Customer dashboard pages
│   │   ├── index.tsx         # Overview
│   │   ├── orders.tsx        # Order history
│   │   ├── order-detail.tsx  # Single order view
│   │   └── profile.tsx       # Edit name/phone
│   └── admin/                # Admin dashboard pages
│       ├── index.tsx         # Admin overview
│       ├── products.tsx      # Product CRUD
│       ├── orders.tsx        # All orders management
│       ├── order-detail.tsx  # Order details + status update
│       ├── users.tsx         # User management (super admin only)
│       └── profile.tsx
├── components/
│   ├── dashboard-layout.tsx  # Sidebar layout for dashboards
│   ├── protected-route.tsx   # Auth guards
│   ├── theme-toggle.tsx      # Dark/light mode
│   └── ui/                   # Shadcn components
└── lib/
    ├── auth.tsx              # Auth context and hooks
    ├── cart.tsx              # Cart context with localStorage
    └── queryClient.ts        # TanStack Query setup

server/
├── routes.ts                 # All API endpoints
├── storage.ts                # Database operations
├── email.ts                  # Nodemailer OTP sending
├── seed.ts                   # Sample products and super admin
└── db.ts                     # Drizzle database connection

shared/
└── schema.ts                 # Drizzle schema and types
```

### Database Schema
- **users**: id, email, name, phone, role (customer/admin/superadmin), isRegistered
- **products**: id, name, description, price, imageUrl, category, stock, weight, origin, isActive
- **orders**: id, orderNumber, userId, status, paymentStatus, totalAmount, shipping details
- **orderItems**: id, orderId, productId, productName, productPrice, quantity
- **reviews**: id, productId, userId, rating (1-5), comment, createdAt
- **otpTokens**: id, email, otp, expiresAt

### Authentication Flow
1. User enters email on /login
2. Server sends 6-digit OTP via Nodemailer to email
3. User enters OTP to verify
4. If new user, prompted for name and phone
5. Session stored with express-session (7-day expiry)

### Role-Based Access
- **Customer**: Can browse, add to cart, checkout, view own orders, edit profile
- **Admin**: All customer abilities + manage products, view all orders, update order status
- **Super Admin**: All admin abilities + manage users, create admins (email: kaushlendrs.k12@fms.edu)

### Key Features
- Persistent login via sessions
- Cart stored in localStorage (guest cart)
- UAE emirates dropdown for shipping
- Free shipping on orders over 200 AED
- Cash on Delivery payment method
- HTML invoice generation
- Dark/light theme support

## Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Express session secret
- `SMTP_HOST` - Email SMTP host
- `SMTP_PORT` - Email SMTP port
- `SMTP_USER` - Email username
- `SMTP_PASS` - Email password
- `AWS_ACCESS_KEY_ID` - AWS access key for S3
- `AWS_SECRET_ACCESS_KEY` - AWS secret key for S3
- `AWS_S3_BUCKET` - S3 bucket name for product images
- `AWS_REGION` - AWS region (e.g., us-east-1)

## User Preferences
- No emojis in UI - use Lucide icons instead
- Honey/amber color scheme (#D97706 primary)
- Arabic-English locale support for UAE

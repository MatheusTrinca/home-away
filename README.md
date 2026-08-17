# HomeAway

> Feel at home, away from home.

HomeAway is an Airbnb-style rental marketplace where users can list properties, favorite
and review them, book stays, and pay by card. Built with Next.js 14 (App Router), Prisma,
Clerk, Stripe, and Supabase.

## Features

- 🔐 **User authentication** with Clerk (sign in, sign up, and profiles)
- 🏠 **Property listings** with image upload, categories, amenities, and country location
- ❤️ **Favorites** to save properties you like
- ⭐ **Reviews and ratings** left by guests
- 🗓️ **Bookings** with a date-range picker and automatic nights/total calculation
- 💳 **Payments** via Stripe Checkout (embedded mode)
- 🗺️ **Interactive map** of the property location with Leaflet
- 📊 **Admin dashboard** with stats and charts (Recharts)
- 🌗 **Light/dark theme** with next-themes

## Tech Stack

| Layer          | Technology                                        |
| -------------- | ------------------------------------------------- |
| Framework      | [Next.js 14](https://nextjs.org/) (App Router)    |
| Language       | TypeScript                                        |
| Styling        | Tailwind CSS + shadcn/ui (Radix UI)               |
| Database       | PostgreSQL (Supabase) via [Prisma](https://www.prisma.io/) |
| Authentication | [Clerk](https://clerk.com/)                       |
| Payments       | [Stripe](https://stripe.com/)                     |
| Storage        | Supabase Storage (images)                         |
| Validation     | Zod                                               |
| State          | Zustand                                           |
| Maps           | Leaflet / react-leaflet                           |
| Charts         | Recharts                                          |

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com/) account (Postgres database + storage)
- A [Clerk](https://clerk.com/) account
- A [Stripe](https://stripe.com/) account

## Getting Started

1. **Clone the repository and install dependencies:**

   ```bash
   git clone <repository-url>
   cd home-away
   npm install
   ```

2. **Configure environment variables.**

   Copy the example file and fill it in with your credentials:

   ```bash
   cp .env.example .env
   ```

   | Variable | Description |
   | --- | --- |
   | `DATABASE_URL` | Postgres connection string (with pgbouncer) |
   | `DIRECT_URL` | Direct connection string (used for migrations) |
   | `SUPABASE_URL` / `SUPABASE_KEY` | Supabase project URL and service key (storage) |
   | `CLERK_SECRET_KEY` / `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk keys |
   | `ADMIN_USER_ID` | Clerk user ID with access to the admin dashboard |
   | `NEXT_PUBLIC_WEBSITE_URL` | Base URL of the app |
   | `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe keys |

3. **Set up the database:**

   ```bash
   npx prisma generate
   npx prisma db push
   npm run seed        # (optional) populate the database with sample data
   ```

4. **Run the development server:**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command         | Description                                     |
| --------------- | ----------------------------------------------- |
| `npm run dev`   | Start the development server                    |
| `npm run build` | Generate the Prisma Client and build for prod   |
| `npm run start` | Start the production server                     |
| `npm run lint`  | Run ESLint                                       |
| `npm run seed`  | Populate the database with sample data          |

## Project Structure

```
app/
  api/            # API routes (Stripe: payment / confirm)
  admin/          # Admin dashboard
  properties/     # Property listing and detail pages
  rentals/        # Management of the user's own listings
  bookings/       # The user's bookings
  reservations/   # Reservations received on the host's listings
  reviews/        # The user's reviews
  favorites/      # Favorited properties
  profile/        # User profile
components/        # UI components (Radix / shadcn)
prisma/           # Database schema and seed
utils/            # Server actions, Zod schemas, helpers, and stores
```

## Data Models

The Prisma schema defines five core models: `Profile`, `Property`, `Favorite`,
`Review`, and `Booking`. See [prisma/schema.prisma](prisma/schema.prisma) for details.

## Payments

The payment flow uses Stripe Checkout in *embedded* mode:

1. The user creates a `Booking` with dates and a calculated total.
2. `POST /api/payment` creates a Stripe checkout session.
3. After payment, Stripe redirects to `GET /api/confirm`, which marks the
   booking as paid (`paymentStatus = true`).

---

Learning project based on a Next.js course.

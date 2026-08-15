### Stripe

[Embedded Form](https://docs.stripe.com/checkout/embedded/quickstart)

- setup and add keys to .env
- install

```sh
npm install --save @stripe/react-stripe-js @stripe/stripe-js stripe axios
```

### Refactor createBookingAction

```ts
export const createBookingAction = async (prevState: {
  propertyId: string;
  checkIn: Date;
  checkOut: Date;
}) => {
  // create variable
  let bookingId: null | string = null;

  try {
    const booking = await db.booking.create(....);
    // change value
    bookingId = booking.id;
  } catch (error) {
    return renderError(error);
  }
  // redirect to checkout
  redirect(`/checkout?bookingId=${bookingId}`);
};
```

### Checkout Page

```tsx
'use client';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';
import React, { useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
);

export default function CheckoutPage() {
  const searchParams = useSearchParams();

  const bookingId = searchParams.get('bookingId');

  const fetchClientSecret = useCallback(async () => {
    // Create a Checkout Session
    const response = await axios.post('/api/payment', {
      bookingId: bookingId,
    });
    return response.data.clientSecret;
  }, []);

  const options = { fetchClientSecret };

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
```

### API - Payment Route

api/payment/route.ts

```ts
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
import { type NextRequest, type NextResponse } from 'next/server';
import db from '@/utils/db';
import { formatDate } from '@/utils/format';
export const POST = async (req: NextRequest, res: NextResponse) => {
  const requestHeaders = new Headers(req.headers);
  const origin = requestHeaders.get('origin');

  const { bookingId } = await req.json();

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: {
      property: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  });

  if (!booking) {
    return Response.json(null, {
      status: 404,
      statusText: 'Not Found',
    });
  }
  const {
    totalNights,
    orderTotal,
    checkIn,
    checkOut,
    property: { image, name },
  } = booking;

  try {
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      metadata: { bookingId: booking.id },
      line_items: [
        {
          // Provide the exact Price ID (for example, pr_1234) of
          // the product you want to sell
          quantity: 1,
          price_data: {
            currency: 'usd',

            product_data: {
              name: `${name}`,
              images: [image],
              description: `Stay in this wonderful place for ${totalNights} nights, from ${formatDate(
                checkIn
              )} to ${formatDate(checkOut)}. Enjoy your stay!`,
            },
            unit_amount: orderTotal * 100,
          },
        },
      ],
      mode: 'payment',
      return_url: `${origin}/api/confirm?session_id={CHECKOUT_SESSION_ID}`,
    });

    return Response.json({ clientSecret: session.client_secret });
  } catch (error) {
    console.log(error);

    return Response.json(null, {
      status: 500,
      statusText: 'Internal Server Error',
    });
  }
};
```

### API - Confirm Route

api/confirm/route.ts

```ts
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
import { redirect } from 'next/navigation';

import { type NextRequest, type NextResponse } from 'next/server';
import db from '@/utils/db';

export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const session_id = searchParams.get('session_id') as string;

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    // console.log(session);

    const bookingId = session.metadata?.bookingId;
    if (session.status === 'complete' && bookingId) {
      await db.booking.update({
        where: { id: bookingId },
        data: { paymentStatus: true },
      });
    }
  } catch (err) {
    console.log(err);
    return Response.json(null, {
      status: 500,
      statusText: 'Internal Server Error',
    });
  }
  redirect('/bookings');
};
```

### Refactor Actions

- remove all bookings with 'paymentStatus' false, before creating a booking
  createBookingAction.ts

```ts
export const createBookingAction = async (prevState: {
  propertyId: string;
  checkIn: Date;
  checkOut: Date;
}) => {
  let bookingId: null | string = null;

  const user = await getAuthUser();

  await db.booking.deleteMany({
    where: {
      profileId: user.id,
      paymentStatus: false,
    },
  });
.....
}
```

- Check for 'paymentStatus' when fetching bookings

  - fetchBookings
  - rentalsWithBookingSums
  - fetchReservations
  - fetchStats

  ```ts
  const bookingsCount = await db.booking.count({
    where: {
      paymentStatus: true,
    },
  });
  ```

  - fetchChartsData

### Reservation Stats

- actions.ts

```ts
export const fetchReservationStats = async () => {
  const user = await getAuthUser();
  const properties = await db.property.count({
    where: {
      profileId: user.id,
    },
  });

  const totals = await db.booking.aggregate({
    _sum: {
      orderTotal: true,
      totalNights: true,
    },
    where: {
      property: {
        profileId: user.id,
      },
    },
  });

  return {
    properties,
    nights: totals._sum.totalNights || 0,
    amount: totals._sum.orderTotal || 0,
  };
};
```

- create components/reservations/Stats.tsx

```tsx
import StatsCards from '@/components/admin/StatsCard';
import { fetchReservationStats } from '@/utils/actions';
import { formatCurrency } from '@/utils/format';
async function Stats() {
  const stats = await fetchReservationStats();

  return (
    <div className="mt-8 grid md:grid-cols-2 gap-4 lg:grid-cols-3">
      <StatsCards title="properties" value={stats.properties} />
      <StatsCards title="nights" value={stats.nights} />
      <StatsCards title="total" value={formatCurrency(stats.amount)} />
    </div>
  );
}
export default Stats;
```

- refactor StatsCard.tsx

```tsx
import { Card, CardHeader } from '@/components/ui/card';

type StatsCardsProps = {
  title: string;
  value: number | string;
};
```

- render in reservations

```tsx
import Stats from '@/components/reservations/Stats';

return (
  <>
    <Stats />
    ....
  </>
);
```

### 🚀🚀🚀 THE END 🚀🚀🚀

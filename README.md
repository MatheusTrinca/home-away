### Rentals Page

- create rentals/loading.tsx

```tsx
'use client';
import LoadingTable from '@/components/booking/LoadingTable';
function loading() {
  return <LoadingTable />;
}
export default loading;
```

```tsx
import EmptyList from '@/components/home/EmptyList';
import { fetchRentals, deleteRentalAction } from '@/utils/actions';
import Link from 'next/link';

import { formatCurrency } from '@/utils/format';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import FormContainer from '@/components/form/FormContainer';
import { IconButton } from '@/components/form/Buttons';

async function RentalsPage() {
  const rentals = await fetchRentals();

  if (rentals.length === 0) {
    return (
      <EmptyList
        heading="No rentals to display."
        message="Don't hesitate to create a rental."
      />
    );
  }

  return (
    <div className="mt-16">
      <h4 className="mb-4 capitalize">Active Properties : {rentals.length}</h4>
      <Table>
        <TableCaption>A list of all your properties.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Property Name</TableHead>
            <TableHead>Nightly Rate </TableHead>
            <TableHead>Nights Booked</TableHead>
            <TableHead>Total Income</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rentals.map(rental => {
            const { id: propertyId, name, price } = rental;
            const { totalNightsSum, orderTotalSum } = rental;
            return (
              <TableRow key={propertyId}>
                <TableCell>
                  <Link
                    href={`/properties/${propertyId}`}
                    className="underline text-muted-foreground tracking-wide"
                  >
                    {name}
                  </Link>
                </TableCell>
                <TableCell>{formatCurrency(price)}</TableCell>
                <TableCell>{totalNightsSum || 0}</TableCell>
                <TableCell>{formatCurrency(orderTotalSum)}</TableCell>

                <TableCell className="flex items-center gap-x-2">
                  <Link href={`/rentals/${propertyId}/edit`}>
                    <IconButton actionType="edit"></IconButton>
                  </Link>
                  <DeleteRental propertyId={propertyId} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function DeleteRental({ propertyId }: { propertyId: string }) {
  const deleteRental = deleteRentalAction.bind(null, { propertyId });
  return (
    <FormContainer action={deleteRental}>
      <IconButton actionType="delete" />
    </FormContainer>
  );
}

export default RentalsPage;
```

### Fetch Rental Details

- actions.ts

```ts
export const fetchRentalDetails = async (propertyId: string) => {
  const user = await getAuthUser();

  return db.property.findUnique({
    where: {
      id: propertyId,
      profileId: user.id,
    },
  });
};

export const updatePropertyAction = async () => {
  return { message: 'update property action' };
};

export const updatePropertyImageAction = async () => {
  return { message: 'update property image' };
};
```

### Rentals Edit Page

- rentals/[id]/edit/page.tsx

```tsx
import {
  fetchRentalDetails,
  updatePropertyImageAction,
  updatePropertyAction,
} from '@/utils/actions';
import FormContainer from '@/components/form/FormContainer';
import FormInput from '@/components/form/FormInput';
import CategoriesInput from '@/components/form/CategoriesInput';
import PriceInput from '@/components/form/PriceInput';
import TextAreaInput from '@/components/form/TextAreaInput';
import CountriesInput from '@/components/form/CountriesInput';
import CounterInput from '@/components/form/CounterInput';
import AmenitiesInput from '@/components/form/AmenitiesInput';
import { SubmitButton } from '@/components/form/Buttons';
import { redirect } from 'next/navigation';
import { type Amenity } from '@/utils/amenities';
import ImageInputContainer from '@/components/form/ImageInputContainer';

async function EditRentalPage({ params }: { params: { id: string } }) {
  const property = await fetchRentalDetails(params.id);

  if (!property) redirect('/');

  const defaultAmenities: Amenity[] = JSON.parse(property.amenities);

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-8 capitalize">Edit Property</h1>
      <div className="border p-8 rounded-md ">
        <ImageInputContainer
          name={property.name}
          text="Update Image"
          action={updatePropertyImageAction}
          image={property.image}
        >
          <input type="hidden" name="id" value={property.id} />
        </ImageInputContainer>

        <FormContainer action={updatePropertyAction}>
          <input type="hidden" name="id" value={property.id} />
          <div className="grid md:grid-cols-2 gap-8 mb-4 mt-8">
            <FormInput
              name="name"
              type="text"
              label="Name (20 limit)"
              defaultValue={property.name}
            />
            <FormInput
              name="tagline"
              type="text "
              label="Tagline (30 limit)"
              defaultValue={property.tagline}
            />
            <PriceInput defaultValue={property.price} />
            <CategoriesInput defaultValue={property.category} />
            <CountriesInput defaultValue={property.country} />
          </div>

          <TextAreaInput
            name="description"
            labelText="Description (10 - 100 Words)"
            defaultValue={property.description}
          />

          <h3 className="text-lg mt-8 mb-4 font-medium">
            Accommodation Details
          </h3>
          <CounterInput detail="guests" defaultValue={property.guests} />
          <CounterInput detail="bedrooms" defaultValue={property.bedrooms} />
          <CounterInput detail="beds" defaultValue={property.beds} />
          <CounterInput detail="baths" defaultValue={property.baths} />
          <h3 className="text-lg mt-10 mb-6 font-medium">Amenities</h3>
          <AmenitiesInput defaultValue={defaultAmenities} />
          <SubmitButton text="edit property" className="mt-12" />
        </FormContainer>
      </div>
    </section>
  );
}
export default EditRentalPage;
```

### Amenities Input

```tsx
'use client';
import { useState } from 'react';
import { amenities, Amenity } from '@/utils/amenities';
import { Checkbox } from '@/components/ui/checkbox';

function AmenitiesInput({ defaultValue }: { defaultValue?: Amenity[] }) {
  const amenitiesWithIcons = defaultValue?.map(({ name, selected }) => ({
    name,
    selected,
    icon: amenities.find(amenity => amenity.name === name)!.icon,
  }));
  const [selectedAmenities, setSelectedAmenities] = useState<Amenity[]>(
    amenitiesWithIcons || amenities
  );
  const handleChange = (amenity: Amenity) => {
    setSelectedAmenities(prev => {
      return prev.map(a => {
        if (a.name === amenity.name) {
          return { ...a, selected: !a.selected };
        }
        return a;
      });
    });
  };

  return (
    <section>
      <input
        type="hidden"
        name="amenities"
        value={JSON.stringify(selectedAmenities)}
      />
      <div className="grid grid-cols-2 gap-4">
        {selectedAmenities.map(amenity => {
          return (
            <div key={amenity.name} className="flex items-center space-x-2">
              <Checkbox
                id={amenity.name}
                checked={amenity.selected}
                onCheckedChange={() => handleChange(amenity)}
              />
              <label
                htmlFor={amenity.name}
                className="text-sm font-medium leading-none capitalize flex gap-x-2 items-center"
              >
                {amenity.name} <amenity.icon className="w-4 h-4" />
              </label>
            </div>
          );
        })}
      </div>
    </section>
  );
}
export default AmenitiesInput;
```

### Update Property Action

```ts
export const updatePropertyAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAuthUser();
  const propertyId = formData.get('id') as string;

  try {
    const rawData = Object.fromEntries(formData);
    const validatedFields = validateWithZodSchema(propertySchema, rawData);
    await db.property.update({
      where: {
        id: propertyId,
        profileId: user.id,
      },
      data: {
        ...validatedFields,
      },
    });

    revalidatePath(`/rentals/${propertyId}/edit`);
    return { message: 'Update Successful' };
  } catch (error) {
    return renderError(error);
  }
};
```

### Update Property Image Action

```ts
export const updatePropertyImageAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAuthUser();
  const propertyId = formData.get('id') as string;

  try {
    const image = formData.get('image') as File;
    const validatedFields = validateWithZodSchema(imageSchema, { image });
    const fullPath = await uploadImage(validatedFields.image);

    await db.property.update({
      where: {
        id: propertyId,
        profileId: user.id,
      },
      data: {
        image: fullPath,
      },
    });
    revalidatePath(`/rentals/${propertyId}/edit`);
    return { message: 'Property Image Updated Successful' };
  } catch (error) {
    return renderError(error);
  }
};
```

### Reservations

- in app/reservations create page.tsx and loading.tsx

```tsx
'use client';

import LoadingTable from '@/components/booking/LoadingTable';

function loading() {
  return <LoadingTable />;
}
export default loading;
```

- add to links

utils/links.ts

```ts
export const links: NavLink[] = [
  { href: '/', label: 'home' },
  { href: '/favorites ', label: 'favorites' },
  { href: '/bookings ', label: 'bookings' },
  { href: '/reviews ', label: 'reviews' },
  { href: '/reservations ', label: 'reservations' },
  { href: '/rentals/create ', label: 'create rental' },
  { href: '/rentals', label: 'my rentals' },
  { href: '/profile ', label: 'profile' },
];
```

### Fetch Reservations

```ts
export const fetchReservations = async () => {
  const user = await getAuthUser();

  const reservations = await db.booking.findMany({
    where: {
      property: {
        profileId: user.id,
      },
    },

    orderBy: {
      createdAt: 'desc', // or 'asc' for ascending order
    },

    include: {
      property: {
        select: {
          id: true,
          name: true,
          price: true,
          country: true,
        },
      }, // include property details in the result
    },
  });
  return reservations;
};
```

### Reservations Page

```tsx
import { fetchReservations } from '@/utils/actions';
import Link from 'next/link';
import EmptyList from '@/components/home/EmptyList';
import CountryFlagAndName from '@/components/card/CountryFlagAndName';

import { formatDate, formatCurrency } from '@/utils/format';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

async function ReservationsPage() {
  const reservations = await fetchReservations();

  if (reservations.length === 0) {
    return <EmptyList />;
  }

  return (
    <div className="mt-16">
      <h4 className="mb-4 capitalize">
        total reservations : {reservations.length}
      </h4>
      <Table>
        <TableCaption>A list of your recent reservations.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Property Name</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Nights</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Check In</TableHead>
            <TableHead>Check Out</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reservations.map(item => {
            const { id, orderTotal, totalNights, checkIn, checkOut } = item;
            const { id: propertyId, name, country } = item.property;
            const startDate = formatDate(checkIn);
            const endDate = formatDate(checkOut);
            return (
              <TableRow key={id}>
                <TableCell>
                  <Link
                    href={`/properties/${propertyId}`}
                    className="underline text-muted-foreground tracking-wide"
                  >
                    {name}
                  </Link>
                </TableCell>
                <TableCell>
                  <CountryFlagAndName countryCode={country} />
                </TableCell>
                <TableCell>{totalNights}</TableCell>
                <TableCell>{formatCurrency(orderTotal)}</TableCell>
                <TableCell>{startDate}</TableCell>
                <TableCell>{endDate}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
export default ReservationsPage;
```

### Admin User - Setup

- create app/admin/page.tsx
- add admin to links
- create components/admin
  - Chart.tsx
  - ChartsContainer.tsx
  - Loading.tsx
  - StatsCard.tsx
  - StatsContainer.tsx

### Admin User - Middleware

- refactor middleware
- create ENV variable with userId
- add to VERCEL

```ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher(['/', '/properties(.*)']);

const isAdminRoute = createRouteMatcher(['/admin(.*)']);
export default clerkMiddleware(async (auth, req) => {
  const isAdminUser = auth().userId === process.env.ADMIN_USER_ID;
  if (isAdminRoute(req) && !isAdminUser) {
    return NextResponse.redirect(new URL('/', req.url));
  }
  if (!isPublicRoute(req)) auth().protect();
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

### Admin User - LinksDropdown

- LinksDropdown.tsx

```tsx
import { auth } from '@clerk/nextjs/server';

function LinksDropdown() {
  const { userId } = auth();
  const isAdminUser = userId === process.env.ADMIN_USER_ID;
}
return (
  <>
    {links.map(link => {
      if (link.label === 'admin' && !isAdminUser) return null;
      return (
        <DropdownMenuItem key={link.href}>
          <Link href={link.href} className="capitalize w-full">
            {link.label}
          </Link>
        </DropdownMenuItem>
      );
    })}
  </>
);
```

### Admin User - Loading

```tsx
import { Card, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function StatsLoadingContainer() {
  return (
    <div className="mt-8 grid md:grid-cols-2 gap-4 lg:grid-cols-3">
      <LoadingCard />
      <LoadingCard />
      <LoadingCard />
    </div>
  );
}

function LoadingCard() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="w-full h-20 rounded" />
      </CardHeader>
    </Card>
  );
}

export function ChartsLoadingContainer() {
  return <Skeleton className="mt-16 w-full h-[300px] rounded" />;
}
```

### Admin User - Main Page

```tsx
import ChartsContainer from '@/components/admin/ChartsContainer';
import StatsContainer from '@/components/admin/StatsContainer';
import {
  ChartsLoadingContainer,
  StatsLoadingContainer,
} from '@/components/admin/Loading';
import { Suspense } from 'react';
async function AdminPage() {
  return (
    <>
      <Suspense fallback={<StatsLoadingContainer />}>
        <StatsContainer />
      </Suspense>
      <Suspense fallback={<ChartsLoadingContainer />}>
        <ChartsContainer />
      </Suspense>
    </>
  );
}
export default AdminPage;
```

### Admin User - Fetch Stats

```ts
const getAdminUser = async () => {
  const user = await getAuthUser();
  if (user.id !== process.env.ADMIN_USER_ID) redirect('/');
  return user;
};

export const fetchStats = async () => {
  await getAdminUser();

  const usersCount = await db.profile.count();
  const propertiesCount = await db.property.count();
  const bookingsCount = await db.booking.count();

  return {
    usersCount,
    propertiesCount,
    bookingsCount,
  };
};
```

### Admin User - StatsContainer

```tsx
import { fetchStats } from '@/utils/actions';
import StatsCard from './StatsCard';
async function StatsContainer() {
  const data = await fetchStats();

  return (
    <div className="mt-8 grid md:grid-cols-2 gap-4 lg:grid-cols-3">
      <StatsCard title="users" value={data?.usersCount || 0} />
      <StatsCard title="properties" value={data?.propertiesCount || 0} />
      <StatsCard title="bookings" value={data?.bookingsCount || 0} />
    </div>
  );
}
export default StatsContainer;
```

### Admin User - StatsCard

```tsx
import { Card, CardHeader } from '@/components/ui/card';

type StatsCardsProps = {
  title: string;
  value: number;
};

function StatsCards({ title, value }: StatsCardsProps) {
  return (
    <Card className="bg-muted">
      <CardHeader className="flex flex-row justify-between items-center">
        <h3 className="capitalize text-3xl font-bold">{title}</h3>
        <span className="text-primary text-5xl font-extrabold">{value}</span>
      </CardHeader>
    </Card>
  );
}

export default StatsCards;
```

### Admin User - Fetch Charts Data

```ts
export const fetchChartsData = async () => {
  await getAdminUser();
  const date = new Date();
  date.setMonth(date.getMonth() - 6);
  const sixMonthsAgo = date;

  const bookings = await db.booking.findMany({
    where: {
      createdAt: {
        gte: sixMonthsAgo,
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });
  let bookingsPerMonth = bookings.reduce((total, current) => {
    const date = formatDate(current.createdAt, true);

    const existingEntry = total.find(entry => entry.date === date);
    if (existingEntry) {
      existingEntry.count += 1;
    } else {
      total.push({ date, count: 1 });
    }
    return total;
  }, [] as Array<{ date: string; count: number }>);
  return bookingsPerMonth;
};
```

format.ts

```ts
export const formatDate = (date: Date, onlyMonth?: boolean) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
  };

  if (!onlyMonth) {
    options.day = 'numeric';
  }

  return new Intl.DateTimeFormat('en-US', options).format(date);
};
```

### Admin User - ChartsContainer

```tsx
import { fetchChartsData } from '@/utils/actions';
import Chart from './Chart';

async function ChartsContainer() {
  const bookings = await fetchChartsData();
  if (bookings.length < 1) return null;

  return <Chart data={bookings} />;
}
export default ChartsContainer;
```

### Recharts

[Recharts](https://recharts.org/en-US/)

```sh
npm install recharts
```

### Admin User - Chart Component

```tsx
'use client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type ChartPropsType = {
  data: {
    date: string;
    count: number;
  }[];
};

function Chart({ data }: ChartPropsType) {
  return (
    <section className="mt-24">
      <h1 className="text-4xl font-semibold text-center">Monthly Bookings</h1>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 50 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" fill="#F97215" barSize={75} />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}
export default Chart;
```

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

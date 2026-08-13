import { PrismaClient } from '@prisma/client';
import { createClerkClient } from '@clerk/backend';

const db = new PrismaClient();
const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY as string,
});

const PASSWORD = 'HomeAway#2026';

// mesmo formato salvo pelo AmenitiesInput (JSON de [{ name, selected }])
const amenities = JSON.stringify([
  { name: 'unlimited cloud storage', selected: true },
  { name: 'self-lighting fire pit', selected: true },
  { name: 'gourmet coffee station', selected: true },
  { name: 'starlight roof window', selected: false },
]);

type SeedUser = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  profileImage: string;
  property: {
    id: string;
    name: string;
    tagline: string;
    category: string;
    image: string;
    country: string;
    description: string;
    price: number;
    guests: number;
    bedrooms: number;
    beds: number;
    baths: number;
  };
};

const seedUsers: SeedUser[] = [
  {
    firstName: 'John',
    lastName: 'Doe',
    username: 'johndoe',
    email: 'john.doe@example.com',
    profileImage: '',
    property: {
      id: 'seed-cabin',
      name: 'Cozy Pine Cabin',
      tagline: 'Escape to the woods',
      category: 'cabin',
      image: '',
      country: 'US',
      description:
        'A warm wooden cabin tucked between tall pines, perfect for a quiet weekend away from the busy city life.',
      price: 250,
      guests: 4,
      bedrooms: 2,
      beds: 3,
      baths: 1,
    },
  },
  {
    firstName: 'Peter',
    lastName: 'Smith',
    username: 'petersmith',
    email: 'peter.smith@example.com',
    profileImage: '',
    property: {
      id: 'seed-caravan',
      name: 'Retro Road Caravan',
      tagline: 'Adventure on wheels',
      category: 'caravan',
      image: '',
      country: 'CA',
      description:
        'A vintage caravan fully restored with cozy interiors, ready to take you wherever the open road leads next.',
      price: 120,
      guests: 2,
      bedrooms: 1,
      beds: 1,
      baths: 1,
    },
  },
  {
    firstName: 'Susan',
    lastName: 'Jones',
    username: 'susanjones',
    email: 'susan.jones@example.com',
    profileImage: '',
    property: {
      id: 'seed-tent',
      name: 'Starlight Camp Tent',
      tagline: 'Sleep under the stars',
      category: 'tent',
      image: '',
      country: 'FR',
      description:
        'A spacious canvas tent set on a wooden deck, letting you fall asleep counting stars and wake up to birdsong.',
      price: 80,
      guests: 2,
      bedrooms: 1,
      beds: 1,
      baths: 1,
    },
  },
];

const getOrCreateClerkUser = async (u: SeedUser) => {
  const existing = await clerk.users.getUserList({ emailAddress: [u.email] });
  if (existing.data.length > 0) return existing.data[0];

  return clerk.users.createUser({
    emailAddress: [u.email],
    password: PASSWORD,
    firstName: u.firstName,
    lastName: u.lastName,
    skipPasswordChecks: true, // evita rejeição por senha "vazada"
  });
};

const seedOne = async (u: SeedUser) => {
  const clerkUser = await getOrCreateClerkUser(u);

  // marca hasProfile p/ o app não tentar recriar (casa com ensureProfile)
  await clerk.users.updateUser(clerkUser.id, {
    privateMetadata: { hasProfile: true },
  });

  await db.profile.upsert({
    where: { clerkId: clerkUser.id },
    update: {
      firstName: u.firstName,
      lastName: u.lastName,
      username: u.username,
      email: u.email,
      profileImage: u.profileImage,
    },
    create: {
      clerkId: clerkUser.id,
      firstName: u.firstName,
      lastName: u.lastName,
      username: u.username,
      email: u.email,
      profileImage: u.profileImage,
    },
  });

  const { id, ...propData } = u.property;
  await db.property.upsert({
    where: { id },
    update: { ...propData, amenities, profileId: clerkUser.id },
    create: { id, ...propData, amenities, profileId: clerkUser.id },
  });

  return { email: u.email, clerkId: clerkUser.id };
};

const main = async () => {
  const results: { email: string; clerkId: string }[] = [];

  for (const u of seedUsers) {
    try {
      results.push(await seedOne(u));
      console.log(`ok seeded ${u.firstName} ${u.lastName} (${u.email})`);
    } catch (error) {
      console.error(`x falha ao seedar ${u.email}:`, error);
      throw error;
    }
  }

  console.log('\n=== Credenciais de login ===');
  for (const r of results) {
    console.log(`  email: ${r.email}   senha: ${PASSWORD}`);
  }
  console.log('============================\n');
};

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

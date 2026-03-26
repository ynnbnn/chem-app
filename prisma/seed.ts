import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create test user
  const user = await prisma.user.upsert({
    where: { email: "test@chemcomply.app" },
    update: {},
    create: {
      email: "test@chemcomply.app",
      name: "Max Mustermann",
    },
  });

  // Create organization
  const org = await prisma.organization.upsert({
    where: { id: "test-org-1" },
    update: {},
    create: {
      id: "test-org-1",
      name: "Mustermann Agrar GmbH",
      plan: "TRIAL",
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  // Create membership
  await prisma.member.upsert({
    where: { userId_organizationId: { userId: user.id, organizationId: org.id } },
    update: {},
    create: {
      userId: user.id,
      organizationId: org.id,
      role: "OWNER",
    },
  });

  // Create sample products
  const product1 = await prisma.product.upsert({
    where: { id: "prod-1" },
    update: {},
    create: {
      id: "prod-1",
      organizationId: org.id,
      name: "Roundup PowerFlex",
      activeIngredient: "Glyphosat 480 g/l",
      concentration: "480 g/l",
      applicationRate: "3-4 l/ha",
      reentryInterval: "48",
      ppiNumber: "024162-00",
    },
  });

  const product2 = await prisma.product.upsert({
    where: { id: "prod-2" },
    update: {},
    create: {
      id: "prod-2",
      organizationId: org.id,
      name: "Karate Zeon",
      activeIngredient: "Lambda-Cyhalothrin 100 g/l",
      concentration: "100 g/l",
      applicationRate: "75 ml/ha",
      reentryInterval: "24",
      ppiNumber: "024305-00",
    },
  });

  const product3 = await prisma.product.upsert({
    where: { id: "prod-3" },
    update: {},
    create: {
      id: "prod-3",
      organizationId: org.id,
      name: "Folpan 80 WDG",
      activeIngredient: "Folpet 800 g/kg",
      concentration: "800 g/kg",
      applicationRate: "1.5 kg/ha",
      reentryInterval: "24",
    },
  });

  // Create sample fields
  const field1 = await prisma.field.upsert({
    where: { id: "field-1" },
    update: {},
    create: {
      id: "field-1",
      organizationId: org.id,
      name: "Parzelle 7 - Nordwest",
      areaSqMeters: 25000,
    },
  });

  const field2 = await prisma.field.upsert({
    where: { id: "field-2" },
    update: {},
    create: {
      id: "field-2",
      organizationId: org.id,
      name: "Obstgarten Süd",
      areaSqMeters: 8000,
    },
  });

  const field3 = await prisma.field.upsert({
    where: { id: "field-3" },
    update: {},
    create: {
      id: "field-3",
      organizationId: org.id,
      name: "Weinberg Ost",
      areaSqMeters: 15000,
    },
  });

  // Get member for applications
  const member = await prisma.member.findFirst({
    where: { userId: user.id, organizationId: org.id },
  });

  if (!member) return;

  // Create sample applications
  const now = new Date();

  await prisma.application.upsert({
    where: { id: "app-1" },
    update: {},
    create: {
      id: "app-1",
      organizationId: org.id,
      memberId: member.id,
      productId: product1.id,
      fieldId: field1.id,
      appliedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      quantityUsed: 3.5,
      quantityUnit: "l",
      areaTreatedSqM: 25000,
      targetOrganism: "Unkraut",
      applicationMethod: "Sprühgerät",
      latitude: 47.3769,
      longitude: 8.5417,
      weatherTemp: 18.5,
      weatherHumidity: 65,
      weatherWindSpeed: 3.2,
      weatherWindDir: "NW",
      weatherCondition: "bewölkt",
      reentryDeadline: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 48 * 60 * 60 * 1000),
      status: "COMPLETED",
    },
  });

  await prisma.application.upsert({
    where: { id: "app-2" },
    update: {},
    create: {
      id: "app-2",
      organizationId: org.id,
      memberId: member.id,
      productId: product2.id,
      fieldId: field2.id,
      appliedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      quantityUsed: 0.075,
      quantityUnit: "l",
      areaTreatedSqM: 8000,
      targetOrganism: "Blattläuse",
      applicationMethod: "Sprühgerät",
      latitude: 47.3800,
      longitude: 8.5450,
      weatherTemp: 22.1,
      weatherHumidity: 55,
      weatherWindSpeed: 1.8,
      weatherWindDir: "S",
      weatherCondition: "sonnig",
      reentryDeadline: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000 + 24 * 60 * 60 * 1000),
      status: "COMPLETED",
    },
  });

  await prisma.application.upsert({
    where: { id: "app-3" },
    update: {},
    create: {
      id: "app-3",
      organizationId: org.id,
      memberId: member.id,
      productId: product3.id,
      fieldId: field3.id,
      appliedAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
      quantityUsed: 1.5,
      quantityUnit: "kg",
      areaTreatedSqM: 15000,
      targetOrganism: "Mehltau",
      applicationMethod: "Sprühgerät",
      latitude: 47.3750,
      longitude: 8.5500,
      weatherTemp: 16.3,
      weatherHumidity: 72,
      weatherWindSpeed: 2.5,
      weatherWindDir: "W",
      weatherCondition: "leicht bewölkt",
      reentryDeadline: new Date(now.getTime() - 3 * 60 * 60 * 1000 + 24 * 60 * 60 * 1000),
      status: "DRAFT",
      notes: "Behandlung wegen starkem Mehltaubefall vorgezogen.",
    },
  });

  console.log("Seed erfolgreich! Testdaten wurden erstellt.");
  console.log("Login: test@chemcomply.app");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

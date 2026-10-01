import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding CocoBiz database with demo data...");

  // ─── Farm Owners ─────────────────────────────────────────────────────────────
  const owners = await Promise.all([
    prisma.farmOwner.upsert({
      where: { ownerCode: "OWN-1001" },
      update: {},
      create: {
        ownerCode: "OWN-1001",
        name: "Rajan Murugan",
        phone: "9876543210",
        village: "Kottaiyur",
        taluk: "Dindigul",
        district: "Dindigul",
        address: "12, Azhiyur Street, Kottaiyur",
        bankName: "Canara Bank",
        accountNumber: "3042100089210",
        ifsc: "CNRB0001234",
        status: "ACTIVE",
      },
    }),
    prisma.farmOwner.upsert({
      where: { ownerCode: "OWN-1002" },
      update: {},
      create: {
        ownerCode: "OWN-1002",
        name: "Selvi Arumugam",
        phone: "9865012347",
        village: "Pattiveeranpatti",
        taluk: "Dindigul",
        district: "Dindigul",
        address: "45, Kovai Road, Pattiveeranpatti",
        bankName: "SBI",
        accountNumber: "62001234567",
        ifsc: "SBIN0002345",
        status: "ACTIVE",
      },
    }),
    prisma.farmOwner.upsert({
      where: { ownerCode: "OWN-1003" },
      update: {},
      create: {
        ownerCode: "OWN-1003",
        name: "Anbazhagan Pillai",
        phone: "9944332211",
        village: "Vedasandur",
        taluk: "Vedasandur",
        district: "Dindigul",
        status: "ACTIVE",
      },
    }),
  ]);

  console.log(`✓ Created ${owners.length} farm owners`);

  // ─── Farms ──────────────────────────────────────────────────────────────────
  const farms = await Promise.all([
    prisma.farm.upsert({
      where: { farmCode: "FRM-001" },
      update: {},
      create: {
        farmCode: "FRM-001",
        name: "Green Valley Farm",
        ownerId: owners[0].id,
        village: "Kottaiyur",
        taluk: "Dindigul",
        district: "Dindigul",
        totalTrees: 450,
        location: "Survey No. 123, Kottaiyur",
        status: "ACTIVE",
      },
    }),
    prisma.farm.upsert({
      where: { farmCode: "FRM-002" },
      update: {},
      create: {
        farmCode: "FRM-002",
        name: "Sunrise Coconut Estate",
        ownerId: owners[0].id,
        village: "Kottaiyur",
        taluk: "Dindigul",
        district: "Dindigul",
        totalTrees: 320,
        status: "ACTIVE",
      },
    }),
    prisma.farm.upsert({
      where: { farmCode: "FRM-003" },
      update: {},
      create: {
        farmCode: "FRM-003",
        name: "Selvi's Eastern Farm",
        ownerId: owners[1].id,
        village: "Pattiveeranpatti",
        totalTrees: 280,
        status: "ACTIVE",
      },
    }),
    prisma.farm.upsert({
      where: { farmCode: "FRM-004" },
      update: {},
      create: {
        farmCode: "FRM-004",
        name: "Pillai Heritage Garden",
        ownerId: owners[2].id,
        village: "Vedasandur",
        totalTrees: 600,
        status: "ACTIVE",
      },
    }),
  ]);

  console.log(`✓ Created ${farms.length} farms`);

  // ─── Tree Bookings ────────────────────────────────────────────────────────────
  const bookings = await Promise.all([
    prisma.treeBooking.upsert({
      where: { bookingCode: "TB-2026-001" },
      update: {},
      create: {
        bookingCode: "TB-2026-001",
        ownerId: owners[0].id,
        farmId: farms[0].id,
        totalTreesBooked: 200,
        pricePerTree: 180,
        bookingDate: new Date("2026-08-01"),
        expectedHarvestDate: new Date("2026-10-15"),
        status: "IN_PROGRESS",
      },
    }),
    prisma.treeBooking.upsert({
      where: { bookingCode: "TB-2026-002" },
      update: {},
      create: {
        bookingCode: "TB-2026-002",
        ownerId: owners[1].id,
        farmId: farms[2].id,
        totalTreesBooked: 150,
        pricePerTree: 170,
        bookingDate: new Date("2026-09-01"),
        expectedHarvestDate: new Date("2026-11-01"),
        status: "BOOKED",
      },
    }),
    prisma.treeBooking.upsert({
      where: { bookingCode: "TB-2026-003" },
      update: {},
      create: {
        bookingCode: "TB-2026-003",
        ownerId: owners[2].id,
        farmId: farms[3].id,
        totalTreesBooked: 300,
        pricePerTree: 200,
        bookingDate: new Date("2026-07-15"),
        expectedHarvestDate: new Date("2026-09-30"),
        status: "COMPLETED",
      },
    }),
  ]);

  console.log(`✓ Created ${bookings.length} tree bookings`);

  // ─── Harvest Records ──────────────────────────────────────────────────────────
  const harvests = await Promise.all([
    prisma.harvestRecord.upsert({
      where: { harvestCode: "HARV-2026-001" },
      update: {},
      create: {
        harvestCode: "HARV-2026-001",
        bookingId: bookings[0].id,
        ownerId: owners[0].id,
        farmId: farms[0].id,
        harvestDate: new Date("2026-09-05"),
        treesHarvested: 100,
        coconutCount: 1250,
        avgCoconutsPerTree: 12.5,
        coconutPrice: 22,
        totalCoconutAmount: 27500,
      },
    }),
    prisma.harvestRecord.upsert({
      where: { harvestCode: "HARV-2026-002" },
      update: {},
      create: {
        harvestCode: "HARV-2026-002",
        bookingId: bookings[0].id,
        ownerId: owners[0].id,
        farmId: farms[0].id,
        harvestDate: new Date("2026-09-20"),
        treesHarvested: 80,
        coconutCount: 960,
        avgCoconutsPerTree: 12,
        coconutPrice: 22,
        totalCoconutAmount: 21120,
      },
    }),
    prisma.harvestRecord.upsert({
      where: { harvestCode: "HARV-2026-003" },
      update: {},
      create: {
        harvestCode: "HARV-2026-003",
        bookingId: bookings[2].id,
        ownerId: owners[2].id,
        farmId: farms[3].id,
        harvestDate: new Date("2026-09-25"),
        treesHarvested: 300,
        coconutCount: 3900,
        avgCoconutsPerTree: 13,
        coconutPrice: 20,
        totalCoconutAmount: 78000,
      },
    }),
  ]);

  console.log(`✓ Created ${harvests.length} harvest records`);

  // ─── Purchases ───────────────────────────────────────────────────────────────
  await prisma.coconutPurchase.upsert({
    where: { purchaseCode: "PUR-2026-001" },
    update: {},
    create: {
      purchaseCode: "PUR-2026-001",
      ownerId: owners[1].id,
      farmId: farms[2].id,
      purchaseDate: new Date("2026-09-15"),
      coconutType: "WITH_HUSK",
      quantity: 2000,
      pricePerCoconut: 18,
      totalAmount: 36000,
      paymentStatus: "PARTIALLY_PAID",
    },
  });

  console.log("✓ Created coconut purchases");

  // ─── Farmer Payments ─────────────────────────────────────────────────────────
  await Promise.all([
    prisma.farmerPayment.upsert({
      where: { paymentCode: "PAY-2026-001" },
      update: {},
      create: {
        paymentCode: "PAY-2026-001",
        ownerId: owners[0].id,
        amount: 30000,
        paymentMethod: "UPI",
        referenceNumber: "UPI9923456",
        paymentDate: new Date("2026-09-10"),
        notes: "Advance payment for Green Valley harvest",
      },
    }),
    prisma.farmerPayment.upsert({
      where: { paymentCode: "PAY-2026-002" },
      update: {},
      create: {
        paymentCode: "PAY-2026-002",
        ownerId: owners[2].id,
        amount: 50000,
        paymentMethod: "BANK_TRANSFER",
        referenceNumber: "NEFT2026001",
        paymentDate: new Date("2026-09-28"),
        notes: "Payment for Pillai Heritage harvest",
      },
    }),
  ]);

  console.log("✓ Created farmer payments");

  // ─── Inventory Transactions ───────────────────────────────────────────────────
  const existingTxCount = await prisma.inventoryTransaction.count();
  if (existingTxCount === 0) {
    await prisma.inventoryTransaction.createMany({
      data: [
        { date: new Date("2026-09-05"), product: "COCONUT", transactionType: "HARVEST", quantity: 1250, referenceType: "HARVEST", referenceId: harvests[0].id, notes: "Harvest from Green Valley Farm" },
        { date: new Date("2026-09-20"), product: "COCONUT", transactionType: "HARVEST", quantity: 960, referenceType: "HARVEST", referenceId: harvests[1].id },
        { date: new Date("2026-09-25"), product: "COCONUT", transactionType: "HARVEST", quantity: 3900, referenceType: "HARVEST", referenceId: harvests[2].id },
        { date: new Date("2026-09-15"), product: "COCONUT", transactionType: "PURCHASE", quantity: 2000, referenceType: "PURCHASE", notes: "Purchase from Selvi Arumugam" },
        { date: new Date("2026-09-18"), product: "COCONUT", transactionType: "HUSK_REMOVAL", quantity: -2500, referenceType: "HUSK_REMOVAL", notes: "Sent for husk removal" },
        { date: new Date("2026-09-22"), product: "HUSK", transactionType: "HARVEST", quantity: 2500, referenceType: "HUSK_REMOVAL", notes: "Husk generated from removal" },
        { date: new Date("2026-09-28"), product: "COCONUT", transactionType: "COPRA_PROCESSING", quantity: -1000, notes: "Sent for copra drying" },
        { date: new Date("2026-09-30"), product: "COPRA", transactionType: "HARVEST", quantity: 180, notes: "Copra produced from 1000 nuts" },
      ],
    });
  }

  console.log("✓ Created inventory transactions");

  // ─── Husk Removal ─────────────────────────────────────────────────────────────
  await prisma.huskRemoval.upsert({
    where: { batchCode: "HR-2026-001" },
    update: {},
    create: {
      batchCode: "HR-2026-001",
      date: new Date("2026-09-18"),
      coconutQtyUsed: 2500,
      huskGenerated: 2500,
      huskWeightKg: 1875,
      notes: "First batch husk removal",
    },
  });

  console.log("✓ Created husk removal record");

  // ─── Copra Processing ─────────────────────────────────────────────────────────
  await prisma.copraProcessing.upsert({
    where: { batchCode: "CP-2026-001" },
    update: {},
    create: {
      batchCode: "CP-2026-001",
      date: new Date("2026-09-28"),
      coconutQtyUsed: 1000,
      copraProducedKg: 180,
      processingCost: 5000,
      notes: "Kiln drying batch",
    },
  });

  console.log("✓ Created copra processing record");

  // ─── Customers ────────────────────────────────────────────────────────────────
  const customers = await Promise.all([
    prisma.customer.upsert({
      where: { customerCode: "CUST-001" },
      update: {},
      create: {
        customerCode: "CUST-001",
        name: "Karthik Coconut Traders",
        phone: "9988776655",
        businessName: "Karthik Trading Co.",
        address: "Anna Salai, Chennai",
        status: "ACTIVE",
      },
    }),
    prisma.customer.upsert({
      where: { customerCode: "CUST-002" },
      update: {},
      create: {
        customerCode: "CUST-002",
        name: "Priya Oil Mills",
        phone: "9977443322",
        businessName: "Priya Copra Oil Mill",
        address: "Pollachi Road, Coimbatore",
        status: "ACTIVE",
      },
    }),
    prisma.customer.upsert({
      where: { customerCode: "CUST-003" },
      update: {},
      create: {
        customerCode: "CUST-003",
        name: "Murugan Wholesale Mart",
        phone: "9966112233",
        address: "Market Road, Madurai",
        status: "ACTIVE",
      },
    }),
  ]);

  console.log(`✓ Created ${customers.length} customers`);

  // ─── Sales ────────────────────────────────────────────────────────────────────
  await Promise.all([
    prisma.sale.upsert({
      where: { invoiceNumber: "INV-2026-001" },
      update: {},
      create: {
        invoiceNumber: "INV-2026-001",
        customerId: customers[0].id,
        saleDate: new Date("2026-09-22"),
        product: "COCONUT",
        quantity: 3000,
        unitPrice: 26,
        totalAmount: 78000,
        paymentStatus: "PAID",
        paymentMethod: "UPI",
      },
    }),
    prisma.sale.upsert({
      where: { invoiceNumber: "INV-2026-002" },
      update: {},
      create: {
        invoiceNumber: "INV-2026-002",
        customerId: customers[1].id,
        saleDate: new Date("2026-09-30"),
        product: "COPRA",
        quantity: 150,
        unitPrice: 180,
        totalAmount: 27000,
        paymentStatus: "PAID",
        paymentMethod: "BANK_TRANSFER",
      },
    }),
    prisma.sale.upsert({
      where: { invoiceNumber: "INV-2026-003" },
      update: {},
      create: {
        invoiceNumber: "INV-2026-003",
        customerId: customers[2].id,
        saleDate: new Date("2026-09-25"),
        product: "HUSK",
        quantity: 1000,
        unitPrice: 12,
        totalAmount: 12000,
        paymentStatus: "PARTIALLY_PAID",
        paymentMethod: "CASH",
      },
    }),
  ]);

  console.log("✓ Created sales records");

  // ─── Workers ───────────────────────────────────────────────────────────────────
  const workers = await Promise.all([
    prisma.worker.upsert({
      where: { workerCode: "WRK-001" },
      update: {},
      create: {
        workerCode: "WRK-001",
        name: "Murugesan V",
        phone: "9944556677",
        jobRole: "Harvester",
        salaryType: "DAILY",
        salaryAmount: 650,
        status: "ACTIVE",
      },
    }),
    prisma.worker.upsert({
      where: { workerCode: "WRK-002" },
      update: {},
      create: {
        workerCode: "WRK-002",
        name: "Kannan R",
        phone: "9933445566",
        jobRole: "Peeler",
        salaryType: "DAILY",
        salaryAmount: 600,
        status: "ACTIVE",
      },
    }),
    prisma.worker.upsert({
      where: { workerCode: "WRK-003" },
      update: {},
      create: {
        workerCode: "WRK-003",
        name: "Velu S",
        phone: "9922334455",
        jobRole: "Kiln Operator",
        salaryType: "MONTHLY",
        salaryAmount: 18000,
        status: "ACTIVE",
      },
    }),
    prisma.worker.upsert({
      where: { workerCode: "WRK-004" },
      update: {},
      create: {
        workerCode: "WRK-004",
        name: "Arjun T",
        phone: "9911223344",
        jobRole: "Driver",
        salaryType: "MONTHLY",
        salaryAmount: 22000,
        status: "ACTIVE",
      },
    }),
  ]);

  console.log(`✓ Created ${workers.length} workers`);

  // ─── Salary Payments ──────────────────────────────────────────────────────────
  await Promise.all([
    prisma.salaryPayment.upsert({
      where: { paymentCode: "SAL-2026-001" },
      update: {},
      create: {
        paymentCode: "SAL-2026-001",
        workerId: workers[2].id,
        salaryPeriod: "September 2026",
        amount: 18000,
        paymentMethod: "CASH",
        paymentDate: new Date("2026-09-30"),
      },
    }),
    prisma.salaryPayment.upsert({
      where: { paymentCode: "SAL-2026-002" },
      update: {},
      create: {
        paymentCode: "SAL-2026-002",
        workerId: workers[3].id,
        salaryPeriod: "September 2026",
        amount: 22000,
        paymentMethod: "UPI",
        paymentDate: new Date("2026-09-30"),
      },
    }),
  ]);

  console.log("✓ Created salary payments");

  // ─── Transport Expenses ───────────────────────────────────────────────────────
  await Promise.all([
    prisma.transportExpense.upsert({
      where: { expenseCode: "TRN-2026-001" },
      update: {},
      create: {
        expenseCode: "TRN-2026-001",
        date: new Date("2026-09-05"),
        vehicleNumber: "TN 45 AB 1234",
        driverName: "Arjun T",
        transportType: "PICKUP_TRUCK",
        fromLocation: "Kottaiyur Farm",
        toLocation: "Dindigul Market Yard",
        purpose: "Coconut Procurement",
        amount: 3500,
      },
    }),
    prisma.transportExpense.upsert({
      where: { expenseCode: "TRN-2026-002" },
      update: {},
      create: {
        expenseCode: "TRN-2026-002",
        date: new Date("2026-09-22"),
        vehicleNumber: "TN 45 CD 5678",
        driverName: "Arjun T",
        transportType: "LORRY",
        fromLocation: "Warehouse",
        toLocation: "Chennai",
        purpose: "Market Delivery",
        amount: 7200,
      },
    }),
  ]);

  console.log("✓ Created transport expenses");

  // ─── Other Expenses ───────────────────────────────────────────────────────────
  await Promise.all([
    prisma.otherExpense.upsert({
      where: { expenseCode: "EXP-2026-001" },
      update: {},
      create: {
        expenseCode: "EXP-2026-001",
        date: new Date("2026-09-01"),
        category: "ELECTRICITY",
        description: "Kiln electricity bill - September",
        amount: 8500,
        paymentMethod: "UPI",
      },
    }),
    prisma.otherExpense.upsert({
      where: { expenseCode: "EXP-2026-002" },
      update: {},
      create: {
        expenseCode: "EXP-2026-002",
        date: new Date("2026-09-10"),
        category: "MAINTENANCE",
        description: "Peeling machine maintenance",
        amount: 4200,
        paymentMethod: "CASH",
      },
    }),
    prisma.otherExpense.upsert({
      where: { expenseCode: "EXP-2026-003" },
      update: {},
      create: {
        expenseCode: "EXP-2026-003",
        date: new Date("2026-09-15"),
        category: "PACKAGING",
        description: "Copra packing materials",
        amount: 2100,
        paymentMethod: "CASH",
      },
    }),
  ]);

  console.log("✓ Created other expenses");

  // ─── Daily Prices ─────────────────────────────────────────────────────────────
  const existingPriceCount = await prisma.dailyPrice.count();
  if (existingPriceCount === 0) {
    await prisma.dailyPrice.createMany({
      data: [
        { date: new Date("2026-09-30"), product: "COCONUT", type: "WITH_HUSK", unit: "per nut", price: 24, notes: "Market rate" },
        { date: new Date("2026-09-30"), product: "COCONUT", type: "WITHOUT_HUSK", unit: "per nut", price: 18, notes: "Peeled rate" },
        { date: new Date("2026-09-30"), product: "HUSK", type: "RAW_HUSK", unit: "per kg", price: 8, notes: "Local yard" },
        { date: new Date("2026-09-30"), product: "COPRA", type: "DRIED_COPRA", unit: "per kg", price: 175, notes: "Mill rate" },
      ],
    });
  }

  console.log("✓ Created daily prices");

  console.log("\n🎉 Seeding complete! CocoBiz demo data loaded successfully.");
  console.log("   Run: npm run dev  → Open http://localhost:3000");
}

main()
  .catch((e) => { console.error("❌ Seed error:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());

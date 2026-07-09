import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.log("ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin creation.");
    return;
  }
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin ${email} already exists — skipping.`);
    return;
  }
  await db.user.create({
    data: {
      email,
      name: process.env.ADMIN_NAME || null,
      passwordHash: await bcrypt.hash(password, 12),
      role: "admin",
      status: "active",
    },
  });
  console.log(`Created admin user ${email}`);
}

async function seedContent() {
  const hasContent = await db.video.count();
  if (hasContent > 0) {
    console.log("Content already seeded — skipping.");
    return;
  }

  await db.video.createMany({
    data: [
      {
        title: "Melow demo video",
        description: "A quick overview of how Melow works.",
        videoUrl: "https://www.youtube.com/watch?v=REPLACE_ME_DEMO",
        order: 0,
      },
      {
        title: "Customer case study video",
        description: "How Melow helps enterprise teams turn messy data into operational workflows.",
        videoUrl: "https://www.youtube.com/watch?v=REPLACE_ME_CASE",
        order: 1,
      },
      {
        title: "Platform overview video",
        description: "A walkthrough of Melow’s AI operating layer for data teams.",
        videoUrl: "https://www.youtube.com/watch?v=REPLACE_ME_PLATFORM",
        order: 2,
      },
    ],
  });

  await db.icpBlock.createMany({
    data: [
      {
        title: "Ideal Customer Profile titles",
        bullets: [
          "Chief Data Officer / CDO",
          "Chief Digital Officer / CDO",
          "CIO / CTO",
          "Head of Data",
          "VP Data",
          "VP Digital Transformation",
          "Head of Analytics",
          "Head of Operations",
          "Head of AI / Automation",
          "Business unit leaders who own messy operational workflows",
        ].join("\n"),
        order: 0,
      },
      {
        title: "Company profile",
        bullets: [
          "Large enterprise companies with complex data environments",
          "Companies with fragmented systems, Excel-heavy processes, or manual reporting",
          "Businesses with high-value operational workflows where data quality, automation, and decision speed matter",
          "Sectors: financial services, insurance, industrials, travel, energy, utilities, logistics, retail, and automotive",
          "Companies with existing data teams, BI teams, transformation teams, or operational excellence teams",
        ].join("\n"),
        order: 1,
      },
    ],
  });

  const lists = [
    {
      title: "Top priority accounts",
      description: "Our highest-priority target accounts.",
      accounts: [
        "Siemens", "UBS", "Allianz", "BMW Group", "Volkswagen Group", "Lufthansa Group",
        "Deutsche Telekom", "Iberdrola", "Repsol", "Santander", "BBVA", "AXA", "Zurich Insurance",
        "Munich Re", "Bosch", "Schneider Electric", "ABB", "Airbus", "TUI Group", "Maersk",
        "DHL Group", "Inditex", "Carrefour", "Nestlé",
      ],
    },
    {
      title: "Land and expand accounts",
      description: "Accounts where a narrow first use case could expand into a broader Melow deployment.",
      accounts: [
        "Telefónica", "NTT Data", "Endesa", "Naturgy", "Ferrovial", "ACS Group", "Mapfre",
        "CaixaBank", "Renfe", "Aena", "Acciona", "Sacyr", "Meliá Hotels", "NH Hotels",
        "Iberia", "Cepsa",
      ],
    },
    {
      title: "EMEA strategic accounts",
      description: "Strategic accounts headquartered or heavily active in EMEA.",
      accounts: [
        "Shell", "BP", "TotalEnergies", "Vodafone", "Orange", "Enel", "E.ON", "RWE",
        "ING", "HSBC", "Barclays", "Deutsche Bank", "BNP Paribas", "Société Générale",
        "Generali", "Bayer", "BASF", "Continental", "Stellantis", "Renault Group",
        "Air France-KLM", "Ryanair", "IAG", "EDF",
      ],
    },
  ];

  for (let i = 0; i < lists.length; i++) {
    const list = lists[i];
    await db.accountList.create({
      data: {
        title: list.title,
        description: list.description,
        order: i,
        accounts: {
          create: list.accounts.map((name, j) => ({ name, order: j })),
        },
      },
    });
  }

  await db.salesMaterial.createMany({
    data: [
      {
        title: "Short Deck: An Intro to Melow",
        type: "Deck",
        description: "A quick intro deck for forwarding to prospects.",
        fileUrl: "https://example.com/melow-short-deck.pdf",
        order: 0,
      },
      {
        title: "Long Deck: Melow Overview",
        type: "Deck",
        description: "Full company, product, traction, and roadmap overview.",
        fileUrl: "https://example.com/melow-long-deck.pdf",
        order: 1,
      },
      {
        title: "Siemens Case Study",
        type: "Case study",
        description: "How Melow supports predictive maintenance and operational intelligence.",
        fileUrl: "https://example.com/melow-siemens-case-study.pdf",
        order: 2,
      },
      {
        title: "UBS Case Study",
        type: "Case study",
        description: "How Melow supports enterprise data workflows in financial services.",
        fileUrl: "https://example.com/melow-ubs-case-study.pdf",
        order: 3,
      },
      {
        title: "Predictive Maintenance One-Pager",
        type: "One-pager",
        description: "A concise overview of Melow for predictive maintenance use cases.",
        fileUrl: "https://example.com/melow-predictive-maintenance.pdf",
        order: 4,
      },
      {
        title: "Data OS Overview",
        type: "PDF",
        description: "How Melow creates an operating layer for enterprise data.",
        fileUrl: "https://example.com/melow-data-os-overview.pdf",
        order: 5,
      },
    ],
  });

  await db.blurb.createMany({
    data: [
      {
        title: "LinkedIn warm intro",
        body:
          "Hey [First Name], hope you’re doing well. I wanted to connect you with Pepe and Alex, Co-Founders of Melow. They work with enterprise teams to clean, unify, and operationalize messy data across systems, documents, databases, and spreadsheets. They’re especially strong where teams are still relying on manual reporting, fragmented systems, or heavy Excel workflows. I thought it could be helpful for your team at [Company]. Would you be open to an intro?",
        order: 0,
      },
      {
        title: "Email intro",
        body: [
          "Hi [First Name],",
          "",
          "I wanted to introduce you to Pepe and Alex, Co-Founders of Melow.",
          "",
          "Melow helps enterprise teams turn messy, fragmented data into a clean operating layer for reporting, automation, and AI workflows. They work across structured and unstructured data, connecting to systems like ERPs, databases, spreadsheets, documents, and BI tools.",
          "",
          "Given what your team is working on at [Company], I thought it could be relevant.",
          "",
          "Would you be open to a quick intro?",
          "",
          "Best,",
          "[Your Name]",
        ].join("\n"),
        order: 1,
      },
      {
        title: "Short text / quick DM",
        body:
          "Hey [First Name], wanted to connect you with Pepe and Alex at Melow. They help enterprise teams clean, unify, and automate messy data workflows across systems. Could be useful for [Company]. Open to an intro?",
        order: 2,
      },
    ],
  });

  console.log("Seeded portal content.");
}

async function main() {
  await seedAdmin();
  await seedContent();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let prismaExport: any;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaNeon } = require("@prisma/adapter-neon");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaClient } = require("@prisma/client");

  const globalForPrisma = globalThis as unknown as { _prisma: unknown };

  if (!globalForPrisma._prisma) {
    const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
    globalForPrisma._prisma = new PrismaClient({
      adapter,
      log: ["query", "info", "warn", "error"],
    });
  }

  prismaExport = globalForPrisma._prisma;
} catch {
  console.warn(
    "[Steward] @prisma/client not found — run `pnpm db:generate` to generate the client."
  );
  prismaExport = new Proxy(
    {},
    {
      get(_target, prop: string) {
        if (prop === "then") return undefined;
        throw new Error(
          `Prisma client not initialised. Run \`pnpm db:generate\` then \`pnpm db:migrate\`.`
        );
      },
    }
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const prisma: any = prismaExport;

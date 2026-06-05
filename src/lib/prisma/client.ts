/**
 * Prisma Client Singleton
 *
 * Works before AND after `pnpm db:generate`:
 *  - Before generate: logs a warning, exports a no-op stub
 *  - After generate:  exports the real PrismaClient singleton
 *
 * Setup order:
 *   pnpm install          # installs deps + runs postinstall (prisma generate)
 *   pnpm db:migrate       # applies schema to your database
 *   pnpm db:seed          # seeds initial data
 *   pnpm dev              # start dev server
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let prismaExport: any;

try {
  // Dynamic require so this file compiles even before `prisma generate`.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaClient } = require("@prisma/client");

  const globalForPrisma = globalThis as unknown as { _prisma: unknown };

  prismaExport =
    (globalForPrisma._prisma as typeof prismaExport) ??
    new PrismaClient({
      log:
        process.env.NODE_ENV === "development"
          ? ["error", "warn"]
          : ["error"],
    });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma._prisma = prismaExport;
  }
} catch {
  console.warn(
    "[Steward] @prisma/client not found — run `pnpm db:generate` to generate the client."
  );
  // Return a proxy that throws helpful errors on access
  prismaExport = new Proxy(
    {},
    {
      get(_target, prop: string) {
        if (prop === "then") return undefined; // not a Promise
        throw new Error(
          `Prisma client not initialised. Run \`pnpm db:generate\` then \`pnpm db:migrate\`.`
        );
      },
    }
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const prisma: any = prismaExport;

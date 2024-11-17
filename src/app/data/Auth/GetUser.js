import { GetPrismaClient } from "@/app/db/prisma";

export async function GetUser(username) {
  const prisma = await GetPrismaClient();

  return prisma.user.findFirst({
    where: {
      username,
    },
  });
}

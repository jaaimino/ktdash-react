import { GetPrismaClient } from "@/app/db/prisma";
import { orderBy } from "lodash";

/**
 * Returns News items from the database, most recent first.
 * @function
 * @async
 * @param {Number} max - The max number of new records to return
 * @returns {Promise<Object>} A promise that resolves to an object containing the result of the database query.
 * @throws {Error} If an error occurs during the database query.
 */
export async function GetNews(max) {
  const prisma = await GetPrismaClient();

  if (!max) {
    max = 1000;
  }

  return prisma.News.findMany({
    orderBy: {
      date: 'desc'
    },
    take: max
  });
}

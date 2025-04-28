import { PrismaClient } from "./src/generated/prisma/client";

const prisma = new PrismaClient();

export async function GetPrismaClient() {
  return prisma;
}

export async function findSingleGeneric(
  table,
  identifierProperty,
  identifierValue,
  options = {}
) {
  return await prisma[table].find({
    where: {
      [identifierProperty]: identifierValue
    },
    ...options
  });
}

export async function updateManyGeneric(
  table,
  identifierProperty,
  identifierValue,
  updateProperty,
  updateValue
) {
  return await prisma[table].updateMany({
    where: {
      [identifierProperty]: identifierValue
    },
    data: {
      [updateProperty]: updateValue
    }
  });
}

export async function deleteGeneric(
  table,
  identifierProperty,
  identifierValue,
  options = {}
) {
  await prisma[table].delete({
    where: {
      [identifierProperty]: identifierValue
    },
    ...options
  });
}

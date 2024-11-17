import { GetPrismaClient } from "@/app/db/prisma";
import { GetWeaponByEqId } from "@/app/data/Weapon/GetWeaponByEqId";
import { GetWeaponProfile } from "@/app/data/Weapon/GetWeaponProfile";

export async function GetEquipments(factionId, ktId) {
  const prisma = await GetPrismaClient();

  return prisma.equipment.findMany({
    where: {
      OR: [
        {
          factionid: factionId,
          killteamid: ktId,
        },
        {
          factionid: factionId,
          killteamid: "ALL",
        },
      ],
    },
    orderBy: [{ eqseq: "desc" }, { eqname: "desc" }],
  });
}

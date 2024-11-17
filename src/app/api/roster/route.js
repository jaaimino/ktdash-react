import { GetRoster } from "@/app/data/Roster/GetRoster.js";
import { GetRandomRosterId } from "@/app/data/Roster/GetRandomRosterId.js";
import { GetRosterTacOps } from "@/app/data/Roster/GetRosterTacOps.js";
import { GetRosterOperatives } from "@/app/data/RosterOperative/GetRosterOperatives.js";
import { GetEquipments } from "@/app/data/KillTeam/GetEquipments.js";
import { GetKillTeam } from "@/app/data/KillTeam/GetKillTeam.js";
import { GetRosterEquipment } from "@/app/data/Roster/GetRosterEquipment";
import { GetOperatives } from "@/app/data/Operative/GetOperatives";
import { LoadKillTeam } from "@/app/data/KillTeam/LoadKillTeam";

/**
 * Returns a Roster object from the database based on input rosterId.
 * @function
 * @async
 * @param {Object} req - The Http Request for this API call
 * @returns {Promise<Object>} A promise that resolves to an object containing the result of the request.
 * @throws {Error} If an error occurs.
 */
export async function GET(req) {
  /*
        Sample API request: /api/roster?rosterId=jghim&loadRosterDetail=1
        */
  let [loadRosterDetail, randomSpotlight, rosterId] = [
    req.nextUrl.searchParams.get("loadRosterDetail") ?? "0",
    req.nextUrl.searchParams.get("randomSpotlight") ?? "0",
    req.nextUrl.searchParams.get("rosterId") ?? undefined,
  ];

  if (loadRosterDetail.length > 1 || randomSpotlight.length > 1) {
    return Response.json({ error: "Invalid params" }, { status: 400 });
  }

  if (randomSpotlight === "1") {
    rosterId = await GetRandomRosterId();
  }

  // No roster id passed in, need to get current user's rosters
  if (!rosterId) {
    // TODO: Add auth check here
    const userRoster = await GetRosterByUserId(
      loadRoasterDetail,
      "currentuser.userid",
    );
    const userRosterData = Promise.all(
      userRoster.map(
        async (ur) =>
          await Promise.all([
            GetOperatives(ur.rosterid),
            LoadKillTeam(ur.factionid),
            GetTacOps(ur.rosterid),
            GetRosterEquipment(ur.rosterid),
          ]),
      ),
    );

    return Response.json({ userRosterData });
  } else {
    const roster = await GetRoster(rosterId);

    if (!roster) {
      return Response.json({ error: "Roster Not Found" }, { status: 404 });
    }

    if (loadRosterDetail > 0) {
      await Promise.all([
        (roster.operatives = await GetRosterOperatives(roster.rosterid)),
        (roster.tacops = await GetRosterTacOps(roster.rosterid)),
        (roster.equipments = await GetEquipments(
          roster.factionid,
          roster.killteamid,
        )),
        (roster.killTeam = await GetKillTeam(
          roster.factionid,
          roster.killteamid,
        )),
      ]);
    }

    const skipViewCount = req.nextUrl.searchParams.get("skipviewcount") ?? 1;

    //// TODO: Skip updating view counts if current user is roster's user ID
    //if (!!skipViewCount && skipViewCount != "1") {
    //  await UpdateViewCount(roster.rosterid);
    //}

    return Response.json(roster, { status: 200 });
  }
}

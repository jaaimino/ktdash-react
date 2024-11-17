import React from "react";
import Rosters from "@/page/rosters";
import { request } from "@/hooks/use-api";
import { SWRProvider } from "@/hooks/swr-provider";

export async function generateMetadata({ params }) {
  const username = (await params).user;
  const user = await request(`/user.php?username=${username}`);
  return {
    title: `${user.username}'s Rosters | KTDash.app`,
    description: `KillTeam rosters by ${user.username}`,
    openGraph: {
      title: `${user.username}'s Rosters | KTDash.app`,
      url: `https://ktdash.app/u/${username}`,
      description: `${user.username}'s rosters`,
      images: [`https://ktdash.app/api/rosterportrait.php?rid=${user?.rosters?.[0]?.rosterid}`],
      type: 'website'
    }
  }
}

export default async function RostersRoute({params}) {
  const username = (await params).user;
  const userURL = `/user.php?username=${username}`;
  const user = await request(userURL);
  const fallback = { [userURL]: user }
  return (
    <SWRProvider fallback={fallback}>
      <Rosters />
    </SWRProvider>
  );
}

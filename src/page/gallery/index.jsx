"use client";
import { API_PATH } from "../../hooks/use-api";
import {
  ActionIcon,
  Card,
  Container,
  Group,
  Image,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import React from "react";
import { IconCamera, IconUserDown } from "@tabler/icons-react";
import { useAppContext } from "../../hooks/app-context";
import { modals } from "@mantine/modals";
import useWindowDimensions from "../../hooks/get-window-dimensions";
import { UpdateRosterPotraitModal } from "../roster/modals";
import { UpdateOperativePotraitModal } from "../../components/operative-card/modals";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { fetchRoster } from "@/hooks/use-api/fetchers";
import useSWR from "swr";
import { useSession } from "next-auth/react";

function OperativeGalleryCard(props) {
  const [imageExpire, setImageExpire] = React.useState("");
  const { operative, canEdit = false } = props;
  const handleShowUpdateOperativePortrait = () => {
    modals.open({
      modalId: "update-operative-portrait",
      size: "xl",
      title: <Title order={2}>{operative.opname}</Title>,
      children: (
        <UpdateOperativePotraitModal
          operative={operative}
          onClose={(expire) => setImageExpire(expire)}
        />
      ),
    });
  };
  return (
    <Card>
      <Stack>
        <Group justify="space-between" wrap="nowrap">
          <Stack gap={5}>
            <Title textWrap="pretty" order={3}>
              {operative.opname}
            </Title>
          </Stack>
          {!!canEdit && (
            <ActionIcon
              color="white"
              variant="subtle"
              onClick={handleShowUpdateOperativePortrait}
            >
              <IconCamera />
            </ActionIcon>
          )}
        </Group>
        <Image
          alt="Operative Image"
          onClick={() =>
            modals.open({
              size: "xl",
              title: <Title order={2}>{operative.opname}</Title>,
              children: (
                <Image
                  alt="Operative Image"
                  fit="cover"
                  style={{ objectPosition: "top" }}
                  radius="sm"
                  src={
                    operative.rosteropid
                      ? `${API_PATH}/operativeportrait.php?roid=${operative.rosteropid}&expire=${imageExpire}`
                      : `https://ktdash.app/img/portraits/${operative.factionid}/${operative.killteamid}/${operative.fireteamid}/${operative.opid}.jpg`
                  }
                />
              ),
            })
          }
          fit="cover"
          style={{ objectPosition: "top", cursor: "pointer" }}
          radius="sm"
          src={
            operative.rosteropid
              ? `${API_PATH}/operativeportrait.php?roid=${operative.rosteropid}&expire=${imageExpire}`
              : `https://ktdash.app/img/portraits/${operative.factionid}/${operative.killteamid}/${operative.fireteamid}/${operative.opid}.jpg`
          }
        />
      </Stack>
    </Card>
  );
}

export default function Gallery() {
  const { data: session } = useSession();
  const { user: userData } = session;
  const params = useParams();
  const rosterId = params.roster;
  const { appState, setAppState } = useAppContext();
  const { data: roster } = useSWR(["/roster.php", rosterId], fetchRoster);
  const router = useRouter();
  const canEdit = userData?.username === roster?.username;
  const { width } = useWindowDimensions();
  const isSmallScreen = width <= 600;
  const [imageExpire, setImageExpire] = React.useState("");
  const handleShowUpdateRosterPortrait = React.useCallback(() => {
    modals.open({
      modalId: "update-portrait",
      size: "xl",
      title: <Title order={2}>Edit Portrait</Title>,
      children: (
        <UpdateRosterPotraitModal
          roster={roster}
          onClose={(expire) => setImageExpire(expire)}
        />
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roster]);
  React.useEffect(() => {
    setAppState({
      ...appState,
      contextActions: [
        ...(canEdit
          ? [
              {
                icon: <IconCamera />,
                text: "Edit Portrait",
                onClick: () => handleShowUpdateRosterPortrait(),
              },
            ]
          : []),
        {
          icon: <IconUserDown />,
          text: "Back To Roster",
          onClick: () => {
            router.push(`/r/${roster.rosterid}`);
          },
        },
      ],
    });
    return () => {
      setAppState({
        ...appState,
        contextActions: [],
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canEdit, isSmallScreen, handleShowUpdateRosterPortrait]);
  if (!roster) {
    return;
  }

  return (
    <Container py="md" px="md" fluid>
      <Stack>
        <Stack justify="flex-start" align="flex-start">
          <Group gap={5} align="end">
            <Title>{roster?.rostername}</Title>
            <Text>
              <Link href={`/fa/${roster.factionid}/kt/${roster.killteamid}`}>
                {roster.killteamname} <sup>{roster.edition}</sup>
              </Link>{" "}
              by <Link href={`/u/${roster.username}`}>{roster.username}</Link>
            </Text>
          </Group>
        </Stack>
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing="md">
          <Image
            alt="Roster Image"
            onClick={() =>
              modals.open({
                size: "xl",
                title: <Title order={2}>{roster.rostername}</Title>,
                children: (
                  <Image
                    alt="Roster Image"
                    fit="cover"
                    style={{ objectPosition: "top" }}
                    radius="sm"
                    src={`${API_PATH}/rosterportrait.php?rid=${roster.rosterid}&expire=${imageExpire}`}
                  />
                ),
              })
            }
            fit="cover"
            style={{ objectPosition: "top", cursor: "pointer" }}
            h={"100%"}
            radius="sm"
            src={`${API_PATH}/rosterportrait.php?rid=${roster.rosterid}&expire=${imageExpire}`}
          />
          {roster?.operatives?.map((operative, index) => (
            <OperativeGalleryCard
              key={index}
              canEdit={canEdit}
              operative={operative}
            />
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}

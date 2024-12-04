"use client";
import {
  Title,
  Text,
  Container,
  Card,
  Stack,
  Image,
  Group,
  SimpleGrid,
  Anchor,
} from "@mantine/core";
import classes from "./home.module.css";
import { API_PATH } from "../../hooks/use-api";
import {
  IconEye,
  IconFileImport,
  IconStar,
  IconStarFilled,
} from "@tabler/icons-react";
import News from "./news";
import MainLogo from "../../assets/icon-96x96.png";
import Link from "next/link";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Home(props) {
  const { spotlight } = props;
  const { data: session } = useSession();
  const user = session?.user;

  const router = useRouter();
  return (
    <Stack>
      <div className={classes.wrapper}>
        <div className={classes.inner}>
          <Group gap={0} justify="center">
            <Image
              alt="App Logo"
              h={80}
              component={NextImage}
              w="auto"
              fit="contain"
              src={MainLogo}
            />
            <Title mb="md" className={classes.title}>
              KTDASH
            </Title>
          </Group>
          <Container className={classes.description} size={640}>
            <Text>
              KTDash is a web-based application for running your KillTeam games.
            </Text>
            <ul>
              <li>
                Browse the <Link href="/allfactions">Factions</Link>
              </li>
              <li>
                {user?.username ? (
                  <Link href={`/u/${user?.username}`}>Build a roster</Link>
                ) : (
                  <>Build a roster</>
                )}{" "}
                or <Link href="/u/KTDash">import a pre-built roster</Link>
              </li>
              <li>
                <Link href="/name">Generate names</Link> for your operatives
              </li>
              <li>
                Use the Dashboard view to play your games and track operative
                wounds, TacOps, Ploys, operative orders and activation,
                TP/CP/VP, and more
              </li>
            </ul>
          </Container>
        </div>
      </div>
      {!!spotlight?.rosterid && (
        <Container fluid>
          <Card
            key={spotlight.factionid}
            radius="sm"
            style={{ cursor: "pointer" }}
            onClick={() => router.push(`/r/${spotlight.rosterid}`)}
            className={classes.card}
          >
            <Stack>
              <Title>Roster Spotlight</Title>
              <SimpleGrid cols={{ base: 1, md: 2 }}>
                <Image
                  alt="Roster portrait"
                  h="100%"
                  radius="sm"
                  src={`${API_PATH}/rosterportrait.php?rid=${spotlight.rosterid}`}
                />
                <SimpleGrid
                  visibleFrom="md"
                  cols={{ base: 2, md: 2, lg: 3, xl: 4 }}
                >
                  {spotlight.operatives.map((op, index) => (
                    <Image
                      key={index}
                      alt={op.rosteropid}
                      h="100%"
                      radius="sm"
                      src={`${API_PATH}/operativeportrait.php?roid=${op.rosteropid}`}
                    />
                  ))}
                </SimpleGrid>
              </SimpleGrid>
              <Title order={2} mt={5}>
                {spotlight.rostername}
              </Title>
              {!!spotlight?.notes && <Text>{spotlight.notes}</Text>}
              <Group justify="space-between" gap={5}>
                <Group>
                  {!!spotlight.spotlight ? <IconStarFilled /> : <IconStar />}
                  <Group gap={5}>
                    <IconEye />
                    {spotlight.viewcount.toString()}
                  </Group>
                  <Group gap={5}>
                    <IconFileImport />
                    {spotlight.importcount.toString()}
                  </Group>
                </Group>
                <Group>
                  <Text>
                    <Anchor
                      onClick={(e) => e.stopPropagation()}
                      component={Link}
                      href={`/fa/${spotlight.factionid}/kt/${spotlight.killteamid}`}
                    >
                      {spotlight.killteamname}
                      <sup>{spotlight.edition}</sup>
                    </Anchor>{" "}
                    by{" "}
                    <Anchor
                      component={Link}
                      onClick={(e) => e.stopPropagation()}
                      href={`/u/${spotlight.username}`}
                    >
                      {spotlight.username}
                    </Anchor>
                  </Text>
                </Group>
              </Group>
            </Stack>
          </Card>
        </Container>
      )}
      <Container mb="md" fluid>
        <Card>
          <Title>News</Title>
          <News />
        </Card>
      </Container>
    </Stack>
  );
}

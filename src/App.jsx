import { createTheme, Image, MantineProvider, Title } from "@mantine/core";
import { AppShell, Burger, Group } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { useDisclosure } from "@mantine/hooks";
import { Notifications } from "@mantine/notifications";
import { NavbarSimple } from "./components/navbar";
import Root from "./page";
import MainLogo from "./assets/icon-96x96.png";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "./App.css";
import { Link } from "wouter";
import React, { useRef } from "react";
import AppContextProvider from "./hooks/app-context";
import AppBarMenu from "./components/app-bar-menu";
import "./assets/Oswald-VariableFont_wght.ttf";

const theme = createTheme({
  fontFamily: 'Oswald, "Arial Narrow", Roboto, sans-serif',
  primaryColor: "orange",
  breakpoints: {
    xs: "36em", // Mantine Default: 36em
    sm: "48em", // Mantine Default: 48em
    md: "62em", // Mantine Default: 62em
    lg: "90em", // Mantine Default: 75em
    xl: "114em", // Mantine Default: 88em
  },
});

function App() {
  const [opened, { toggle }] = useDisclosure();
  const button = useRef(null);

  // Stupid ref hack because you can't manually close the nav :|
  const closeNav = () => {
    if (opened) {
      button?.current?.click();
    }
  };

  return (
    <MantineProvider defaultColorScheme="dark" theme={theme}>
      <AppContextProvider>
        <Notifications />
        <ModalsProvider>
          <AppShell
            header={{ height: 60 }}
            navbar={{
              width: 300,
              breakpoint: "md",
              collapsed: { mobile: !opened },
            }}
            padding={0}
          >
            <AppShell.Header>
              <Group
                h="100%"
                px="md"
                gap={5}
                align="center"
                justify="space-between"
                style={{ flex: 1 }}
                wrap="nowrap"
              >
                <Group justify="center" gap={5}>
                  <Burger
                    opened={opened}
                    onClick={toggle}
                    ref={button}
                    hiddenFrom="md"
                    size="sm"
                  />
                  <Link
                    onClick={() => closeNav()}
                    style={{
                      display: "flex",
                      textDecoration: "none",
                      color: "white",
                      alignItems: "center",
                    }}
                    href="/"
                  >
                    <Group gap={5}>
                      <Image
                        alt="App Logo"
                        h={40}
                        w="auto"
                        fit="contain"
                        src={MainLogo}
                      />
                      <Title fontFamily="Anton" order={2}>
                        KTDASH
                      </Title>
                    </Group>
                  </Link>
                </Group>
                <AppBarMenu />
              </Group>
            </AppShell.Header>
            <AppShell.Navbar p="md">
              <NavbarSimple close={closeNav} />
            </AppShell.Navbar>
            <AppShell.Main>
              <Root />
            </AppShell.Main>
          </AppShell>
        </ModalsProvider>
      </AppContextProvider>
    </MantineProvider>
  );
}

export default App;

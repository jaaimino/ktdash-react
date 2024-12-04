"use client";
import {
  AppShell,
  AppShellHeader,
  AppShellMain,
  AppShellNavbar,
} from "@mantine/core";
import { NavbarSimple } from "../navbar";
import AppBarMenu from "../app-bar-menu";
import { useDisclosure } from "@mantine/hooks";

export default function App(props) {
  const { children } = props;

  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: "md", collapsed: { mobile: !opened } }}
      padding={0}
    >
      <AppShellHeader>
        <AppBarMenu opened={opened} toggle={toggle} />
      </AppShellHeader>
      <AppShellNavbar p="md">
        <NavbarSimple />
      </AppShellNavbar>
      <AppShellMain>{children}</AppShellMain>
    </AppShell>
  );
}

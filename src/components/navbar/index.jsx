"use client";

import {
  IconBook,
  IconBrandDiscord,
  IconBrandGithub,
  IconCode,
  IconDownload,
  IconHelp,
  IconLock,
  IconSettings,
  IconTools,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";
import classes from "./navbar.module.css";
import PWAInstallerPrompt from "../install-prompt";
import { NavLink, Stack } from "@mantine/core";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";

export function NavbarSimple(props) {
  const location = usePathname();

  // Get current user's session (if any)
  const { data: session, status } = useSession();
  console.log("🚀 ~ NavbarSimple ~ session:", session);
  console.log("🚀 ~ NavbarSimple ~ status:", status);
  const user = session?.user;

  // Check if logged in
  const [isLoggedIn, setIsLoggedIn] = useState(status === "authenticated");

  const data = [
    {
      link: `/u/${user?.username}`,
      label: "Rosters",
      icon: IconUsers,
      loggedIn: true,
    },
    { link: "/allfactions", label: "Factions", icon: IconBook },
    {
      label: "Tools",
      icon: IconTools,
      children: [{ link: "/name", label: "Name Generator", icon: IconCode }],
    },
    { link: "/settings", label: "Settings", icon: IconSettings },
    { link: "/help", label: "Help", icon: IconHelp },
  ];
  const renderLink = (item, index) => {
    return (
      <Fragment key={index}>
        {!!item.children ? (
          <NavLink
            description={item.description}
            data-active={location.includes(item.link) || undefined}
            key={item.label}
            label={item.label}
            leftSection={<item.icon />}
          >
            {item.children.map((child, childIndex) => (
              <Fragment key={childIndex}>{renderLink(child)}</Fragment>
            ))}
          </NavLink>
        ) : (
          <NavLink
            component={Link}
            description={item.description}
            data-active={location.includes(item.link) || undefined}
            href={item.link}
            key={item.label}
            label={item.label}
            onClick={() => {
              props?.close();
            }}
            leftSection={<item.icon />}
          />
        )}
      </Fragment>
    );
  };
  const links = data
    .filter((link) => !link.loggedIn || isLoggedIn)
    .map(renderLink);

  useEffect(() => {
    console.log(status);
    setIsLoggedIn(status === "authenticated");
  }, [status, setIsLoggedIn, session]);

  return (
    <Stack display="flex" flex={1}>
      <Stack gap={0}>{links}</Stack>
      <Stack gap={0} className={classes.navsection}>
        <NavLink
          target="_blank"
          href={"https://discord.gg/zyuVDgYNeY"}
          label="Discord"
          leftSection={<IconBrandDiscord />}
        />
        <NavLink
          target="_blank"
          href={"https://github.com/jaaimino/ktdash-react"}
          label="Github"
          leftSection={<IconBrandGithub />}
        />
        <PWAInstallerPrompt
          render={({ onClick }) => (
            <NavLink
              leftSection={<IconDownload />}
              onClick={onClick}
              label="App Install"
            ></NavLink>
          )}
          callback={() => {}}
        />
      </Stack>
      <Stack gap={0} className={classes.navsection}>
        {!isLoggedIn ? (
          <>
            <NavLink
              component={Link}
              href="/login"
              data-active={location === "/login" || undefined}
              leftSection={<IconLock />}
              label="Log In"
              onClick={() => {
                props?.close();
              }}
            />
            <NavLink
              component={Link}
              href="/signup"
              data-active={location === "/signup" || undefined}
              label="Sign Up"
              leftSection={<IconUser />}
              onClick={() => {
                props?.close();
              }}
            />
          </>
        ) : (
          <NavLink
            onClick={() => {
              signOut();
              props?.close();
            }}
            label="Log Out"
            leftSection={<IconLock component={Link} />}
          />
        )}
      </Stack>
    </Stack>
  );
}

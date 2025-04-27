'use client'
import { AppShell, AppShellHeader, AppShellMain, AppShellNavbar } from "@mantine/core";
import { NavbarSimple } from "../navbar";
import AppBarMenu from "../app-bar-menu";
import { useDisclosure } from "@mantine/hooks";
import useAuth from "@/hooks/use-auth";
import { useEffect, useState } from "react";

export default function App(props) {
    const { children } = props;

    const [opened, { toggle }] = useDisclosure();

    // Always start with a consistent state for SSR
    const [desktopCollapsed, { toggle: toggleDesktopCollapsed }] = useDisclosure(false);

    // Load collapsed state from localStorage after initial render (client-side only)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedState = localStorage.getItem('sidebarCollapsed') === 'true';
            if (savedState) {
                toggleDesktopCollapsed();
            }
        }
    }, []);
    const auth = useAuth();

    // Save collapsed state to localStorage when it changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('sidebarCollapsed', String(desktopCollapsed));
        }
    }, [desktopCollapsed]);

    // Establish user session if possible
    useEffect(() => {
        auth.setupSession();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{ 
                width: desktopCollapsed ? 80 : 300, 
                breakpoint: 'md', 
                collapsed: { mobile: !opened, desktop: false } 
            }}
            padding={0}
        >
            <AppShellHeader>
                <AppBarMenu opened={opened} toggle={toggle} />
            </AppShellHeader>
            <AppShellNavbar p="md">
                <NavbarSimple 
                    collapsed={desktopCollapsed} 
                    toggleCollapsed={toggleDesktopCollapsed} 
                    close={toggle} 
                />
            </AppShellNavbar>
            <AppShellMain>
                {children}
            </AppShellMain>
        </AppShell>
    );

}

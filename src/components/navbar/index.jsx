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
    IconLayoutSidebarLeftCollapse,
    IconLayoutSidebarLeftExpand,
    IconMenu2,
} from '@tabler/icons-react';
import classes from './navbar.module.css';
import useAuth from '../../hooks/use-auth';
import PWAInstallerPrompt from '../install-prompt';
import { NavLink, Stack } from '@mantine/core';
import Link from 'next/link';
import { usePathname } from 'next/navigation'
import { Fragment, useState } from 'react';

export function NavbarSimple(props) {
    const { collapsed, toggleCollapsed, close } = props;
    const location = usePathname()
    const { user, logout, isLoggedIn } = useAuth();
    const loggedIn = isLoggedIn();
    const [openedMenus, setOpenedMenus] = useState({});
    const data = [
        { link: `/u/${user?.username}`, label: 'Rosters', icon: IconUsers, loggedIn: true },
        { link: '/allfactions', label: 'Factions', icon: IconBook },
        {
            label: 'Tools', icon: IconTools, children: [
                { link: '/name', label: 'Name Generator', icon: IconCode }
            ]
        },
        { link: '/settings', label: 'Settings', icon: IconSettings },
        { link: '/help', label: 'Help', icon: IconHelp },
    ];
    const isChildActive = (children) => {
        if (!children) return false;
        return children.some(child =>
            location.includes(child.link) || (child.children && isChildActive(child.children))
        );
    };

    const renderLink = (item, index) => {
        const isMenuOpen = openedMenus[item.label] || false;
        const handleToggle = () => {
            setOpenedMenus(prev => ({
                ...prev,
                [item.label]: !prev[item.label]
            }));
        };

        return (
            <Fragment key={index}>
                {!!item.children ? <NavLink
                    description={item.description}
                    data-active={(isChildActive(item.children) && !isMenuOpen) || undefined}
                    key={item.label}
                    label={<span className={classes.navLabel}>{item.label}</span>}
                    leftSection={<item.icon />}
                    opened={isMenuOpen}
                    onChange={handleToggle}
                >
                    {item.children.map((child, childIndex) => (<Fragment key={childIndex}>{renderLink(child)}</Fragment>))}
                </NavLink> :
                <NavLink
                    component={Link}
                    description={item.description}
                    data-active={location.includes(item.link) || undefined}
                    href={item.link}
                    key={item.label}
                    label={<span className={classes.navLabel}>{item.label}</span>}
                    onClick={() => {
                        close();
                    }}
                    leftSection={<item.icon />}
                />}
            </Fragment>
        )
    }
    const links = data.filter((link) => !link.loggedIn || loggedIn).map(renderLink);
    return (
        <div className={`${classes.navbarContainer} ${collapsed ? classes.collapsed : ''}`}>
            <Stack display="flex" flex={1}>
                <Stack gap={0}>
                    {links}
                </Stack>
                <Stack gap={0} className={classes.navsection}>
                    <NavLink
                        target="_blank"
                        href={"https://discord.gg/zyuVDgYNeY"}
                        label={<span className={classes.navLabel}>Discord</span>}
                        leftSection={<IconBrandDiscord />}
                    />
                    <NavLink
                        target="_blank"
                        href={"https://github.com/jaaimino/ktdash-react"}
                        label={<span className={classes.navLabel}>Github</span>}
                        leftSection={<IconBrandGithub />}
                    />
                    <PWAInstallerPrompt
                        render={({ onClick }) => (
                            <NavLink
                                leftSection={<IconDownload />}
                                onClick={onClick}
                                label={<span className={classes.navLabel}>App Install</span>}
                            >
                            </NavLink>
                        )}
                        callback={() => { }}
                    />
                </Stack>
                <Stack gap={0} className={classes.navsection}>
                    {!loggedIn ? <>
                        <NavLink
                            component={Link}
                            href="/login"
                            data-active={location === "/login" || undefined}
                            leftSection={<IconLock />}
                            label={<span className={classes.navLabel}>Log In</span>}
                            onClick={() => {
                                close();
                            }}
                        />
                        <NavLink
                            component={Link}
                            href="/signup"
                            data-active={location === "/signup" || undefined}
                            label={<span className={classes.navLabel}>Sign Up</span>}
                            leftSection={<IconUser />}
                            onClick={() => {
                                close();
                            }}
                        />
                    </> : <NavLink
                        onClick={() => {
                            logout();
                            close();
                        }}
                        label={<span className={classes.navLabel}>Log Out</span>}
                        leftSection={<IconLock />}
                    />}
                </Stack>
                <Stack gap={0} className={classes.navsection}>
                    <NavLink
                        className={`${classes.collapseButton} ${collapsed ? classes.expandButton : ''}`}
                        onClick={toggleCollapsed}
                        leftSection={collapsed ? <IconLayoutSidebarLeftExpand /> : <IconLayoutSidebarLeftCollapse />}
                        label={
                            collapsed ?
                            <span className={classes.expandLabel}>Expand</span> :
                            <span className={classes.navLabel}>Collapse</span>
                        }
                        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    />
                </Stack>
            </Stack>
        </div>
    );
}

'use client'
import { ActionIcon, Card, Collapse, Group, Image, Menu, Paper, SimpleGrid, Stack, Table, Text, Title, UnstyledButton, Checkbox, Popover, Button } from "@mantine/core";
import { convertShapes } from "../../utils/shapes";
import { IconArrowBigRight, IconCamera, IconChevronDown, IconChevronUp, IconCrosshair, IconDice, IconDotsVertical, IconDroplet, IconEdit, IconMinus, IconPlus, IconShield, IconSwords, IconTrash, IconTriangleInverted, IconUser, IconUserBolt, IconHeart, IconHeartBroken } from "@tabler/icons-react";
import { API_PATH } from "../../hooks/use-api";
import { modals } from "@mantine/modals";
import parseWeaponRules from "./parser";
import React, { Fragment, useState } from "react";
import { UpdateOperativePotraitModal } from "./modals";
import { useSettings } from "../../hooks/use-settings";

function OrderPicker(props) {
    const { onChange } = props;
    const [opened, setOpened] = useState(false);
    const handleSelectOrder = (order) => {
        setOpened(false);
        onChange(order);
    }
    const orders = [
        {
            img: "/img/icons/EngageOrange.png",
            order: 'engage',
            activated: 0
        },
        {
            img: "/img/icons/ConcealOrange.png",
            order: 'conceal',
            activated: 0
        },
        {
            img: "/img/icons/EngageWhite.png",
            order: 'engage',
            activated: 1
        },
        {
            img: "/img/icons/ConcealWhite.png",
            order: 'conceal',
            activated: 1
        }
    ];
    return (
        <Popover onClick={(event) => {  setOpened(!opened); event.preventDefault(); event.stopPropagation(); }} opened={opened} position="bottom" withArrow shadow="md">
            <Popover.Target onClick={setOpened}>
                {props.children}
            </Popover.Target>
            <Popover.Dropdown onClick={(event) => { event.preventDefault(); event.stopPropagation(); }} bg="var(--mantine-color-body)">
                <Group>
                    {orders.map((order, index) => (
                        <UnstyledButton key={index} onClick={() => handleSelectOrder(order)}>
                            <Image alt="Operative Order" h={40} src={order.img} />
                        </UnstyledButton>
                    ))}
                </Group>
            </Popover.Dropdown>
        </Popover>
    )
}

export default function OperativeCard(props) {
    const {
        operative,
        collapsible,
        editable, onEdit = () => { },
        onDelete = () => { },
        woundTracker, onUpdateWounds = () => { },
        orderTracker, onUpdateOrder = () => { },
        isCustom = false,
        edition = "kt24"
    } = props;
    const [opened, setOpened] = React.useState(true);
    const [settings] = useSettings();
    const [imageExpire, setImageExpire] = React.useState(true);
    const [minusClicked, setMinusClicked] = React.useState(false);
    const [plusClicked, setPlusClicked] = React.useState(false);
    const opImageUrl = operative.rosteropid ? `${API_PATH}/operativeportrait.php?roid=${operative.rosteropid}&expire=${imageExpire}` : `${!isCustom ? 'https://ktdash.app' : ''}/img/portraits/${operative.factionid}/${operative.killteamid}/${operative.fireteamid}/${operative.opid}.jpg`;
    /**
     * Determines the color for wound indicators based on the operative's current wound status
     * - Gray when incapacitated (0 wounds)
     * - Red when critically wounded (below half-health)
     * - White otherwise (healthy)
     */
    const getStatusColor = () => {
        if (!!woundTracker && operative.curW <= 0) {
            return "var(--mantine-color-gray-6)";
        }
        if (!!woundTracker && operative.curW < operative.W / 2) {
            return "var(--mantine-color-red-6)";
        }
        return "var(--mantine-color-white)";
    }

    /**
     * Determines which wound icon to display based on the operative's current wound status
     * - HeartBroken when critically wounded (below half health)
     * - Heart when healthy
     * - Droplet when incapacitated (0 wounds)
     *
     * This provides a visual cue for color-blind users beyond just color changes.
     * Uses gray color when incapacitated (0 wounds) to de-emphasize the operative,
     * and orange color otherwise for consistency.
     * 
     * @returns {JSX.Element} The appropriate icon component
     */
    const getWoundIcon = () => {
        if (!!woundTracker && operative.curW <= 0) {
            return <IconDroplet color="var(--mantine-color-gray-6)" size={20} style={{ transition: 'color 0.3s ease' }} />;
        }
        if (!!woundTracker && operative.curW < operative.W / 2) {
            return <IconHeartBroken color="var(--mantine-color-orange-8)" size={20} style={{ transition: 'color 0.3s ease' }} />;
        }
        return <IconHeart color="var(--mantine-color-orange-8)" size={20} style={{ transition: 'color 0.3s ease' }} />;
    }
    const operativeStatGrid = edition === "kt21" ? (settings.display === "list" ? 6 : 3) : (settings.display === "list" ? 4 : 2);
    if (!operative) {
        return <></>;
    }
    const handleShowUpdateOperativePortrait = () => {
        modals.open({
            modalId: "update-operative-portrait",
            size: "xl",
            title: <Title order={2}>{operative.opname}</Title>,
            children: <UpdateOperativePotraitModal operative={operative} onClose={(expire) => setImageExpire(expire)} />
        });
    }
    const showSpecialRules = (weaponName, weapon, profile) => modals.open({
        size: "lg",
        title: <Title order={3}>{weaponName}</Title>,
        children: (
            <Stack>{parseWeaponRules(operative.edition, weapon, profile).map((rule, index) => (
                <Stack key={index} gap="sm">
                    <Title order={4}><span dangerouslySetInnerHTML={{ __html: convertShapes(rule.rulename) }} /></Title>
                    <Text><span dangerouslySetInnerHTML={{ __html: convertShapes(rule.ruletext) }} /></Text>
                </Stack>
            ))}</Stack>
        ),
    });

    const handleUpdateOrder = (order) => {
        onUpdateOrder(order.order, order.activated);
    }
    const getOrderIconPath = (operative) => {
        return "/img/icons/" + (operative.oporder === 'engage' ? "Engage" : "Conceal") + (operative.activated === 1 ? "White" : "Orange") + ".png";
    }
    const renderWeapon = (weapon) => {
        if (weapon?.profiles?.length > 1) {
            return (
                <>
                    {weapon.profiles.length > 1 && <Table.Tr key={weapon.wepid}>
                        <Table.Td>
                            <span>
                                {weapon.weptype === "M" ?
                                    <IconSwords color="var(--mantine-color-orange-8)" size={20} /> : <IconCrosshair color="var(--mantine-color-orange-8)" size={20} />}
                                <span style={{ marginLeft: '5px' }}>{weapon.wepname}</span>
                            </span>
                        </Table.Td>
                    </Table.Tr>}
                    {weapon.profiles.map((profile) => (
                        <Table.Tr key={profile.profileid}>
                            <Table.Td>- {profile.name} <span role="button" onClick={() => showSpecialRules(`${weapon.wepname} - ${profile.name}`, weapon, profile)} style={{ textDecoration: 'underline', cursor: 'pointer', userSelect: 'none' }}>
                                {profile.SR ? <span dangerouslySetInnerHTML={{ __html: `(${convertShapes(profile.SR)})` }} /> : ''}
                            </span>
                            </Table.Td>
                            <Table.Td style={{ textAlign: 'center' }}>{profile.A}</Table.Td>
                            <Table.Td style={{ textAlign: 'center' }}>{profile.BS}</Table.Td>
                            <Table.Td style={{ textAlign: 'center' }}>{profile.D}</Table.Td>
                        </Table.Tr>
                    ))}
                </>
            )
        }
        return (
            <>
                <Table.Tr key={weapon.wepid}>
                    <Table.Td>
                        <span>
                            {weapon.weptype === "M" ?
                                <IconSwords color=" var(--mantine-color-orange-8)" size={20} /> : <IconCrosshair color=" var(--mantine-color-orange-8)" size={20} />}
                            <span style={{ marginLeft: '5px' }}>
                                {weapon.wepname} <span role="button" onClick={() => showSpecialRules(weapon.wepname, weapon, weapon.profiles[0])} style={{ textDecoration: 'underline', cursor: 'pointer' }}>
                                    {weapon.profiles[0].SR ? <span dangerouslySetInnerHTML={{ __html: `(${convertShapes(weapon.profiles[0].SR)})` }} /> : ''}
                                </span>
                            </span>
                        </span>
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'center' }}>{weapon.profiles[0].A}</Table.Td>
                    <Table.Td style={{ textAlign: 'center' }}>{weapon.profiles[0].BS}</Table.Td>
                    <Table.Td style={{ textAlign: 'center' }}>{weapon.profiles[0].D}</Table.Td>
                </Table.Tr>
            </>
        )
    }
    return (
        <Card padding="xs">
            <Stack gap="xs">
                <Stack style={{ cursor: collapsible ? 'pointer' : 'inherit' }}>
                    {/* Card Title */}
                    <Group justify="space-between" wrap="nowrap" onClick={() => collapsible ? setOpened(!opened) : null}>
                        <Group gap={10} flex={1} wrap="nowrap">
                            {/* Op Order and Activation */}
                            {!!orderTracker && <OrderPicker onChange={handleUpdateOrder}>
                                <Image zindex={1000} alt="Operative Order" src={getOrderIconPath(operative)} h={40} w={40} />
                            </OrderPicker>}
                            {/* Op Name/Type */}
                            <Stack gap={5} flex={1}>
                                <Title textWrap="pretty" order={3}>{settings.opnamefirst === "y" ? operative.opname : operative.optype || operative.opname}</Title>
                                <Text size="sm">{(settings.opnamefirst === "y" || !operative.optype) ? operative.optype : operative.opname}</Text>
                            </Stack>
                        </Group>
                        {!!collapsible && <>{opened ? <IconChevronDown /> : <IconChevronUp />}</>}
                        {!!editable && <Menu withinPortal position="bottom-end" shadow="sm">
                            {/* Op Actions Menu */}
                            <Menu.Target>
                                <ActionIcon variant="subtle" color="gray" onClick={(event) => event.preventDefault()}>
                                    <IconDotsVertical />
                                </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                                {!!editable && <>
                                    <Menu.Item
                                        onClick={() => onEdit(operative)}
                                        leftSection={<IconEdit />}
                                    >
                                        Edit
                                    </Menu.Item>
                                    <Menu.Item
                                        onClick={() => handleShowUpdateOperativePortrait()}
                                        leftSection={<IconCamera />}
                                    >
                                        Edit Portrait
                                    </Menu.Item>
                                    <Menu.Item
                                        onClick={() => onDelete(operative)}
                                        leftSection={<IconTrash />}
                                        color="red"
                                    >
                                        Delete
                                    </Menu.Item>
                                </>}
                            </Menu.Dropdown>
                        </Menu>}
                    </Group>
                </Stack>
                <Collapse in={opened} spacing="xs">
                    <Stack>
                        <Stack>
                            <SimpleGrid cols={{ base: settings.display === "card" ? 2 : 1 }} spacing="xs">
                                {/* Op Portrait */}
                                {settings.display === "card" && <Image alt="Op Portrait"
                                    onClick={() => modals.open({
                                        size: "xl",
                                        title: <Title order={2}>{operative.opname}</Title>,
                                        children: <Image
                                            alt="Op Portrait"
                                            fit="cover"
                                            style={{ objectPosition: "top" }}
                                            radius="sm"
                                            src={opImageUrl}
                                        />
                                    })}
                                    fit="cover"
                                    style={{ objectPosition: "top", cursor: 'pointer' }}
                                    h={140} radius="sm"
                                    src={opImageUrl}
                                />}
                                {/* Op Stats */}
                                <SimpleGrid cols={{ base: operativeStatGrid }} spacing={5}>
                                    <Paper>
                                      <Stack h="100%" justify="center" align="center" gap={5}>
                                        <Text fw={700}>APL</Text>
                                        <Group gap={2}>
                                          <IconTriangleInverted color="var(--mantine-color-orange-8)" size={20} />
                                          <Text fw={700}>{operative.APL}</Text>
                                        </Group>
                                      </Stack>
                                    </Paper>
                                    <Paper>
                                      <Stack h="100%" justify="center" align="center" gap={5}>
                                        <Text fw={700}>{edition !== "kt21" ? "MOVE" : "MV"}</Text>
                                        <Group gap={0}>
                                          {edition !== "kt21" && <IconArrowBigRight color=" var(--mantine-color-orange-8)" size={20} />}
                                          <Text fw={700}><span dangerouslySetInnerHTML={{ __html: `${convertShapes(operative.M)}` }} />
                                          </Text>
                                        </Group>
                                      </Stack>
                                    </Paper>
                                    {edition === "kt21" && <Paper><Stack h="100%" justify="center" align="center" gap={5}><Text fw={700}>GA</Text> <Group gap={2}><IconUser color=" var(--mantine-color-orange-8)" size={20} /><Text fw={700}>{operative.GA}</Text></Group></Stack></Paper>}
                                    {edition === "kt21" && <Paper><Stack h="100%" justify="center" align="center" gap={5}><Text fw={700}>DF</Text> <Group gap={2}><IconDice color=" var(--mantine-color-orange-8)" size={20} /><Text fw={700}>{operative.DF}</Text></Group></Stack></Paper>}
                                    <Paper><Stack h="100%" justify="center" align="center" gap={5}><Text fw={700}>{edition !== "kt21" ? "SAVE" : "SV"}</Text> <Group gap={2}><IconShield color=" var(--mantine-color-orange-8)" size={20} /><Text fw={700}>{operative.SV}</Text></Group></Stack></Paper>
                                    {/*
                                     * Wound Tracking System for Kill Team Operatives
                                     * 
                                     * This component displays and manages the wound status of an operative.
                                     * Features:
                                     * 1. Simple number display showing current and maximum wounds
                                     * 2. Color-coded status indicators:
                                     *    - Gray when incapacitated (0 wounds)
                                     *    - Red when critically wounded (below half health)
                                     *    - Orange when healthy
                                     * 3. Invisible plus/minus buttons that appear on hover/touch
                                     * 4. Mobile-friendly touch interaction with appropriate feedback
                                     * 5. Smooth transition animations for better user experience
                                     * 6. Server-side persistence with optimistic UI updates
                                     */}
                                    {woundTracker ?
                                        (<Paper
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                position: 'relative',
                                                overflow: 'hidden'
                                            }}
                                            className="wound-tracker"
                                        >
                                            <style jsx global>{`
                                                /* Base styles for wound control buttons - invisible by default */
                                                .wound-tracker .wound-controls {
                                                    background: rgba(0,0,0,0);
                                                    border: 1px solid rgba(255,255,255,0);
                                                    z-index: 10;
                                                    cursor: pointer;
                                                    opacity: 0;
                                                    transition: all 0.2s ease;
                                                }

                                                /* Show controls on hover (desktop) */
                                                .wound-tracker:hover .wound-controls {
                                                    opacity: 1;
                                                    background: rgba(0,0,0,0.2);
                                                    border: 1px solid rgba(255,255,255,0.1);
                                                }

                                                /* Set icon color to white for better visibility */
                                                .wound-tracker .wound-controls svg {
                                                    color: white;
                                                }

                                                /* Hide disabled buttons completely */
                                                .wound-tracker .wound-controls[disabled] {
                                                    opacity: 0 !important;
                                                    cursor: default;
                                                }

                                                /* Enhanced hover effect for better feedback */
                                                .wound-tracker .wound-controls:hover {
                                                    background: rgba(0,0,0,0.3);
                                                    border: 1px solid rgba(255,255,255,0.2);
                                                    transform: scale(1.05);
                                                }

                                                /* Mobile-specific styles (devices without hover capability) */
                                                @media (hover: none) {
                                                    /* Keep buttons invisible by default on mobile */
                                                    .wound-tracker .wound-controls {
                                                        opacity: 0;
                                                    }

                                                    /* Show controls on press/touch */
                                                    .wound-tracker:active .wound-controls {
                                                        opacity: 1;
                                                        background: rgba(0,0,0,0.3);
                                                        border: 1px solid rgba(255,255,255,0.2);
                                                    }

                                                    /* Enhanced active state for better touch feedback */
                                                    .wound-tracker:active .wound-controls:active {
                                                        background: rgba(0,0,0,0.4);
                                                        border: 1px solid rgba(255,255,255,0.3);
                                                        transform: scale(1.05);
                                                    }

                                                    /* Keep disabled buttons hidden on mobile too */
                                                    .wound-tracker:active .wound-controls[disabled] {
                                                        opacity: 0 !important;
                                                    }

                                                    /* Auto-hide controls after click with animation */
                                                    .wound-tracker .wound-controls.clicked {
                                                        animation: fadeOutControls 1.5s forwards;
                                                    }

                                                    @keyframes fadeOutControls {
                                                        0% { opacity: 1; }
                                                        70% { opacity: 1; } /* Keep visible for 70% of the animation time */
                                                        100% { opacity: 0; }
                                                    }
                                                }
                                            `}</style>
                                            {/* Central wound display - Shows current/max wounds with appropriate color coding */}
                                            <Stack justify="center" align="center" gap={5} style={{ width: '100%', height: '100%', position: 'relative', zIndex: 1 }}>
                                              <Text fw={700}>{edition !== "kt21" ? "WOUND" : "WND"}</Text>
                                              <Group gap={2}>
                                                {edition !== "kt21" && getWoundIcon()}
                                                <Text
                                                  fw={700}
                                                  style={{
                                                    color: operative.curW <= 0 ? "var(--mantine-color-gray-6)" : "var(--mantine-color-white)",
                                                    transition: 'color 0.3s ease'
                                                  }}
                                                >
                                                  {operative.curW}
                                                </Text>
                                                <Text
                                                  fw={400}
                                                  style={{
                                                    color: 'var(--mantine-color-gray-6)',
                                                    transition: 'color 0.3s ease'
                                                  }}
                                                >
                                                  /{operative.W}
                                                </Text>
                                              </Group>
                                            </Stack>

                                            {/* Left control - Minus button (decreases wounds, full height, 50% width)
                                                 * Appears on hover/touch, disabled when wounds are at 0 */}
                                            <ActionIcon
                                                className={`wound-controls ${minusClicked ? 'clicked' : ''}`}
                                                color="white"
                                                onClick={() => {
                                                    if (operative.curW > 0) {
                                                        setMinusClicked(true);
                                                        onUpdateWounds(Math.max(operative.curW - 1, 0));
                                                        setTimeout(() => {
                                                            setMinusClicked(false);
                                                        }, 100);
                                                    }
                                                }}
                                                disabled={operative.curW <= 0}
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    bottom: 0,
                                                    left: 0,
                                                    width: '50%',
                                                    height: '100%',
                                                    borderRadius: 0,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <IconMinus size={18} />
                                            </ActionIcon>

                                            {/* Right control - Plus button (increases wounds, full height, 50% width)
                                                 * Appears on hover/touch, disabled when wounds are at maximum */}
                                            <ActionIcon
                                                className={`wound-controls ${plusClicked ? 'clicked' : ''}`}
                                                color="white"
                                                onClick={() => {
                                                    if (operative.curW < operative.W) {
                                                        setPlusClicked(true);
                                                        onUpdateWounds(Math.min(operative.curW + 1, operative.W));
                                                        setTimeout(() => {
                                                            setPlusClicked(false);
                                                        }, 100);
                                                    }
                                                }}
                                                disabled={operative.curW >= operative.W}
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    bottom: 0,
                                                    right: 0,
                                                    width: '50%',
                                                    height: '100%',
                                                    borderRadius: 0,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <IconPlus size={18} />
                                            </ActionIcon>
                                        </Paper>)
                                        :
                                        (<Paper>
                                            <Stack h="100%" justify="center" align="center" gap={5}>
                                                <Text fw={700}>{edition !== "kt21" ? "WOUND" : "WND"}</Text>
                                                <Group>{edition !== "kt21" && <IconHeart color="var(--mantine-color-orange-8)" size={20} />}<Text fw={700}>{operative.W}</Text></Group>
                                            </Stack>
                                        </Paper>
                                        )}
                                </SimpleGrid>
                            </SimpleGrid>
                        </Stack>
                        <Paper px="xs">
                            {/* Weapons */}
                            <Stack>
                                <Table horizontalSpacing={2} style={{ fontSize: '14px', marginLeft: '-2px' }}>
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>WEAPONS</Table.Th>
                                            <Table.Th style={{ textAlign: 'center' }}>ATK</Table.Th>
                                            <Table.Th style={{ textAlign: 'center' }}>HIT</Table.Th>
                                            <Table.Th style={{ textAlign: 'center' }}>DMG</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {operative.weapons.map((weapon, index) => (
                                            <Fragment key={index}>{renderWeapon(weapon)}</Fragment>
                                        ))}
                                    </Table.Tbody>
                                </Table>
                            </Stack>
                        </Paper>
                        {(!!operative?.uniqueactions?.length || !!operative?.abilities?.length) && <Paper p="xs"><SimpleGrid cols={{ base: (operative?.uniqueactions?.length && operative?.abilities?.length) ? 2 : 1 }}>
                            {!!operative?.uniqueactions?.length && <Stack gap="xs">
                                {/* Unique Actions */}
                                <Text size="sm" fw={700}>ACTIONS</Text>
                                <Group gap="xs">
                                    {operative?.uniqueactions?.map((ability, index) => (
                                        <Text
                                            key={index}
                                            style={{ textDecoration: 'underline', cursor: 'pointer', userSelect: 'none' }}
                                            onClick={() => {
                                                modals.open({
                                                    size: "lg",
                                                    title: <Title order={2}>{ability.title} {ability.AP ? `(${ability.AP} AP)` : ''}</Title>,
                                                    children: (
                                                        <div dangerouslySetInnerHTML={{ __html: `${convertShapes(ability.description)}` }} />
                                                    ),
                                                });
                                            }}
                                        >
                                            {ability.title} {ability.AP ? `(${ability.AP} AP)` : ''}
                                        </Text>
                                    ))}
                                </Group>
                            </Stack>}
                            {!!operative?.abilities?.length && <Stack gap="xs">
                                {/* Abilities */}
                                <Text size="sm" fw={700}>ABILITIES</Text>
                                <Group gap="xs">
                                    {operative?.abilities?.map((ability, index) => (
                                        <Text
                                            key={index}
                                            role="button"
                                            style={{ textDecoration: 'underline', cursor: 'pointer', userSelect: 'none' }}
                                            onClick={() => {
                                                modals.open({
                                                    size: "lg",
                                                    title: <Title order={2}>{ability.title}</Title>,
                                                    children: (
                                                        <div dangerouslySetInnerHTML={{ __html: `${convertShapes(ability.description)}` }} />
                                                    ),
                                                });
                                            }}
                                        >
                                            {ability.title}
                                        </Text>
                                    ))}
                                </Group>
                            </Stack>}
                        </SimpleGrid></Paper>}
                        {!!operative?.equipments?.length && <Paper p="xs"><Stack gap="xs">
                            {/* Equipment/Options */}
                            <Text size="sm" fw={700}>EQUIPMENT</Text>
                            <Group gap="xs">
                                {operative?.equipments?.map((equip, index) => (
                                    <Text
                                        key={index}
                                        role="button"
                                        style={{ textDecoration: 'underline', cursor: 'pointer', userSelect: 'none' }}
                                        onClick={() => {
                                            modals.open({
                                                size: "lg",
                                                title: <Title order={2}>{equip.eqname}</Title>,
                                                children: (
                                                    <div dangerouslySetInnerHTML={{ __html: `${convertShapes(equip.eqdescription)}` }} />
                                                ),
                                            });
                                        }}
                                    >
                                        {equip.eqname}
                                    </Text>
                                ))}
                            </Group>
                        </Stack></Paper>}
                        {/* Op Keywords */}
                        <Text px={2} size="xs">{operative.keywords}</Text>
                    </Stack>
                </Collapse>
            </Stack>
        </Card>
    );
}

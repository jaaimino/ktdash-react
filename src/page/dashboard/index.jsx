'use client'
import { request } from "../../hooks/use-api";
import { ActionIcon, Card, Container, Group, SimpleGrid, Stack, Tabs, Title } from "@mantine/core";
import OperativeCard from "../../components/operative-card";
import React from "react";
import { IconEdit, IconListCheck, IconMinus, IconPlus, IconRefresh } from "@tabler/icons-react";
import useAuth from "../../hooks/use-auth";
import { useAppContext } from "../../hooks/app-context";
import { debounce, groupBy, keyBy } from "lodash";
import PloyCards from "../../components/ploy-cards";
import EquipmentCards from "../../components/equipment-cards";
import TacOpCards from "../../components/tacop-cards";
import { SelectOperativesModal } from "./modals";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useSettings } from "../../hooks/use-settings";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { fetchRoster } from "@/hooks/use-api/fetchers";

export default function Dashboard() {
    const { user: userData } = useAuth();
    const params = useParams();
    const rosterId = params.roster;
    const [settings] = useSettings();
    const { appState, setAppState } = useAppContext();
    const { data: roster, mutate: setRoster } = useSWR(['/roster.php', rosterId], fetchRoster);
    const router = useRouter();
    const canEdit = userData?.username === roster?.username;
    const killteam = roster?.killteam;
    const isNarrativeEquipment = (equip) => equip.eqid.includes('BS-') || equip.eqid.includes('BH-');
    const groupedEquipment = groupBy(roster?.rostereqs?.filter(equip => !isNarrativeEquipment(equip)), 'eqcategory');
    const handleResetDashboard = React.useCallback(() => {
        request(`/rosterreset.php?rid=${roster?.rosterid}&VP=${settings?.startvp}&CP=${settings?.startcp}`, {
            method: "POST"
        }).then((data) => {
            if (data?.rosterid) {
                notifications.show({
                    title: 'Reset Dashboard',
                    message: `Dashboard successfully reset.`,
                })
                setRoster({
                    ...roster,
                    ...data
                })
            }
        }, { optimisticData: true })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roster]);
    const handleUpdateOperatives = React.useCallback((operatives) => {
        const oldOperatives = keyBy(roster.operatives, 'rosteropid');
        setRoster({
            ...roster,
            operatives
        }, { optimisticData: true, revalidate: false });
        let opCount = 0;
        operatives.forEach((op) => {
            // Only send requests for operatives we actually toggled
            if (oldOperatives[op.rosteropid].hidden !== op.hidden) {
                opCount += 1;
                request(`/rosteroperative.php`, {
                    method: "POST",
                    body: JSON.stringify(op)
                })
            }
        })
        notifications.show({
            title: 'Updated Operatives',
            message: `Successfully updated ${opCount} operatives.`,
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roster]);
    const handleShowSelectOperatives = React.useCallback(() => {
        modals.open({
            modalId: "select-operatives",
            size: "xl",
            title: <Title order={2}>Select Operatives</Title>,
            children: <SelectOperativesModal roster={roster} onClose={handleUpdateOperatives} />
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roster]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const handleSaveUpdateRoster = React.useCallback(debounce((newRoster) => {
        request(`/roster.php`, {
            method: "POST",
            body: JSON.stringify(newRoster)
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, 500), []);
    const handleQuickUpdateRoster = React.useCallback((updates) => {
        const newRoster = {
            "userid": roster.userid,
            "rosterid": roster.rosterid,
            "rostername": roster.rostername,
            "factionid": roster.factionid,
            "killteamid": roster.killteamid,
            "seq": roster.seq,
            "notes": roster.notes,
            "CP": updates.CP ?? roster.CP,
            "TP": updates.TP ?? roster.TP,
            "VP": updates.VP ?? roster.VP,
            "RP": updates.RP ?? roster.RP,
            "ployids": roster.ployids,
            "portraitcopyok": roster.portraitcopyok,
            "keyword": roster.keyword,
            "reqpts": roster.reqpts,
            "stratnotes": roster.stratnotes,
            "eqnotes": roster.eqnotes,
            "specopnotes": roster.specopnotes
        };
        setRoster({
            ...roster,
            ...updates
        }, { optimisticData: true, revalidate: false });
        handleSaveUpdateRoster(newRoster);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roster]);
    const handleSelectPloy = React.useCallback((ploy, checked) => {
        const newPloys = (checked ? [...(roster.ployids.split(',').filter((id) => !!id)), ploy.ployid] : [...(roster.ployids.split(',').filter((id) => !!id).filter((pl) => pl !== ploy.ployid))]);
        const newRoster = {
            "userid": roster.userid,
            "rosterid": roster.rosterid,
            "rostername": roster.rostername,
            "factionid": roster.factionid,
            "killteamid": roster.killteamid,
            "seq": roster.seq,
            "notes": roster.notes,
            "CP": roster.CP,
            "TP": roster.TP,
            "VP": roster.VP,
            "RP": roster.RP,
            "ployids": newPloys.join(','),
            "portraitcopyok": roster.portraitcopyok,
            "keyword": roster.keyword,
            "reqpts": roster.reqpts,
            "stratnotes": roster.stratnotes,
            "eqnotes": roster.eqnotes,
            "specopnotes": roster.specopnotes
        };
        request(`/roster.php`, {
            method: "POST",
            body: JSON.stringify(newRoster)
        })
        setRoster({
            ...roster,
            ...newRoster
        }, { optimisticData: true, revalidate: false });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roster]);
    const handleUpdateTacOp = React.useCallback((tacop) => {
        const newTacOp = {
            "userid": roster.userid,
            "rosterid": roster.rosterid,
            "tacopid": tacop.tacopid,
            "revealed": tacop.revealed,
            "VP1": tacop.VP1,
            "VP2": tacop.VP2
        };
        request(`/rostertacop.php`, {
            method: !!tacop.active ? "POST" : "DELETE",
            body: JSON.stringify(newTacOp)
        })
        setRoster({
            ...roster,
            tacops: [...roster.tacops.map((op) => op.tacopid === tacop.tacopid ? tacop : op)]
        }, { optimisticData: true, revalidate: false });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roster]);
    const handleSelectEquipment = React.useCallback((equipment, checked) => {
        const newEq = {
            "userid": roster.userid,
            "rosterid": roster.rosterid,
            "eqfactionid": equipment.factionid,
            "eqkillteamid": equipment.killteamid,
            "eqid": equipment.eqid
        };
        if (checked) {
            setRoster({
                ...roster,
                rostereqs: [...roster?.rostereqs?.map((eq) => eq.eqid === equipment.eqid ? ({ ...eq, selected: 1 }) : eq)]
            }, { optimisticData: true, revalidate: false });
            request(`/rostereq.php`, {
                method: "POST",
                body: JSON.stringify(newEq)
            })
        } else {
            setRoster({
                ...roster,
                rostereqs: [...roster?.rostereqs?.map((eq) => eq.eqid === equipment.eqid ? ({ ...eq, selected: 0 }) : eq)]
            }, { optimisticData: true, revalidate: false });
            request(`/rostereq.php`, {
                method: "DELETE",
                body: JSON.stringify(newEq)
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roster]);
    const handleUpdateOperativeWounds = React.useCallback((operative, wounds) => {
        request(`/rosteropw.php?roid=${operative.rosteropid}&curW=${wounds}`, {
            method: "POST"
        }).then((data) => {
            if (data?.success) {
                setRoster({
                    ...roster,
                    operatives: roster.operatives?.map((op) => op.rosteropid === operative.rosteropid ? {
                        ...op,
                        curW: wounds
                    } : op)
                }, { optimisticData: true, revalidate: false });
            }
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roster]);
    const handleUpdateOperativeOrder = React.useCallback((operative, newoporder, newactivated) => {
        setRoster({
            ...roster,
            operatives: roster.operatives?.map((op) => op.rosteropid === operative.rosteropid ? {
                ...op,
                activated: newactivated,
                oporder: newoporder
            } : op)
        }, { optimisticData: true, revalidate: false });
        request(`/rosteroporder.php?roid=${operative.rosteropid}&order=${newoporder}`, {
            method: "POST"
        });
        request(`/rosteropactivated.php?roid=${operative.rosteropid}&activated=${newactivated}`, {
            method: "POST"
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roster]);
    React.useEffect(() => {
        setAppState({
            ...appState,
            contextActions: [
                ...(canEdit ? [
                    {
                        icon: <IconListCheck />,
                        text: "Select Operatives",
                        onClick: () => handleShowSelectOperatives()
                    },
                    {
                        icon: <IconEdit />,
                        text: "Edit",
                        onClick: () => {
                            router.push(`/r/${rosterId}`)
                        }
                    },
                    {
                        icon: <IconRefresh />,
                        text: "Reset",
                        onClick: () => handleResetDashboard()
                    }
                ] : [])
            ]
        });
        return () => {
            setAppState({
                ...appState,
                contextActions: []
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canEdit, handleShowSelectOperatives, handleResetDashboard]);
    if (!rosterId) {
        return (
            <Container py="md" px="md" fluid>
                <>No roster selected. Go to <Link href={`/u/${userData?.username}`}>your rosters</Link> and deploy one.</>
            </Container>
        )
    }
    if (!roster) {
        return;
    }
    if (!roster?.rosterid) {
        return (
            <Container py="md" px="md" fluid>
                <>Failed to load roster {rosterId}. Go to <Link href={`/u/${userData?.username}`}>your rosters</Link> and deploy a different one.</>
            </Container>);
    }
    return (
        <Container py="md" px="md" fluid>
            <Stack>
                <Card>
                    <SimpleGrid cols={{ base: 3 }} spacing={0} py="sm">
                        <Stack justify="center" align="center" gap="xs">
                            <Title style={{ borderBottom: '2px solid var(--mantine-color-orange-8)' }} order={3}>CP</Title>
                            <Group gap="xs">
                                <ActionIcon onClick={() => roster.CP !== 0 ? handleQuickUpdateRoster({ CP: roster.CP - 1 }) : () => { }} variant="default"><IconMinus /></ActionIcon>
                                {roster.CP.toString()}
                                <ActionIcon onClick={() => handleQuickUpdateRoster({ CP: roster.CP + 1 })} variant="default"><IconPlus /></ActionIcon>
                            </Group>
                        </Stack>
                        <Stack justify="center" align="center" gap="xs">
                            <Title style={{ borderBottom: '2px solid var(--mantine-color-orange-8)' }} order={3}>TURN</Title>
                            <Group gap="xs">
                                <ActionIcon onClick={() => roster.TP !== 0 ? handleQuickUpdateRoster({ TP: roster.TP - 1 }) : () => { }} variant="default"><IconMinus /></ActionIcon>
                                {roster.TP.toString()}
                                <ActionIcon onClick={() => handleQuickUpdateRoster({ TP: roster.TP + 1 })} variant="default"><IconPlus /></ActionIcon>
                            </Group>
                        </Stack>
                        <Stack justify="center" align="center" gap="xs">
                            <Title style={{ borderBottom: '2px solid var(--mantine-color-orange-8)' }} order={3}>VP</Title>
                            <Group gap="xs">
                                <ActionIcon onClick={() => roster.VP !== 0 ? handleQuickUpdateRoster({ VP: roster.VP - 1 }) : () => { }} variant="default"><IconMinus /></ActionIcon>
                                {roster.VP.toString()}
                                <ActionIcon onClick={() => handleQuickUpdateRoster({ VP: roster.VP + 1 })} variant="default"><IconPlus /></ActionIcon>
                            </Group>
                        </Stack>
                    </SimpleGrid>
                </Card>
                <Tabs defaultValue="operatives">
                    <Tabs.List grow>
                        <Tabs.Tab value="operatives">
                            Operatives
                        </Tabs.Tab>
                        <Tabs.Tab value="ploys">
                            Ploys
                        </Tabs.Tab>
                        {killteam.edition === "kt24" && <Tabs.Tab value="equipment">
                            Equipment
                        </Tabs.Tab>}
                        <Tabs.Tab value="tacops">
                            TacOps
                        </Tabs.Tab>
                    </Tabs.List>
                    <Tabs.Panel value="operatives">
                        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }} mt="md" spacing="md">
                            {roster?.operatives?.filter((op) => !op.hidden)?.map((operative, index) => (
                                <OperativeCard
                                    key={index}
                                    operative={operative}
                                    collapsible
                                    woundTracker onUpdateWounds={(wounds) => handleUpdateOperativeWounds(operative, wounds)}
                                    orderTracker onUpdateOrder={(newoporder, newactivated) => handleUpdateOperativeOrder(operative, newoporder, newactivated)}
                                />
                            ))}
                        </SimpleGrid>
                    </Tabs.Panel>
                    <Tabs.Panel value="ploys">
                        <PloyCards selectable selectedPloys={roster.ployids} onSelect={handleSelectPloy} killteam={killteam} />
                    </Tabs.Panel>
                    {killteam.edition === "kt24" && <Tabs.Panel value="equipment">
                        <EquipmentCards selectable onSelect={handleSelectEquipment} equipment={groupedEquipment} />
                    </Tabs.Panel>}
                    <Tabs.Panel value="tacops">
                        <TacOpCards selectable tacops={roster.tacops} onUpdate={handleUpdateTacOp} />
                    </Tabs.Panel>
                </Tabs>
            </Stack>
        </Container>
    );
}

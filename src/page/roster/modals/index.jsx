import { TextInput, Stack, Button, Group, Select, Table, SimpleGrid, Text, Checkbox, Textarea, LoadingOverlay, Box, ActionIcon, FileInput, Image, Paper, Title, Popover, ScrollArea, Flex } from '@mantine/core';
import { API_PATH, request, requestText } from '../../../hooks/use-api';
import { modals } from '@mantine/modals';
import React from 'react';
import { groupBy, keyBy } from 'lodash';
import { convertShapes } from '../../../utils/shapes';
import { IconArrowBigRight, IconCrosshair, IconDice, IconDroplet, IconHelp, IconPhoto, IconRefresh, IconShield, IconSwords, IconTriangleInverted, IconUser } from '@tabler/icons-react';
import useAuth_deprecated from '../../../hooks/use-auth';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useSettings } from '../../../hooks/use-settings';
import useWindowDimensions from '../../../hooks/get-window-dimensions';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { useListState } from '@mantine/hooks';
import Link from 'next/link';
import useSWR from 'swr';
import { fetchKillteam } from '@/hooks/use-api/fetchers';

export function ShareModal(props) {
    const { roster } = props;
    const baseUrl = window.location.origin;
    const rosterUrl = `${baseUrl}/r/${roster.rosterid}`;
    return (
        <>
            <Stack>
                <Stack gap={5}>
                    <Text>Roster Link: <Link href={rosterUrl}>{roster.rostername}</Link></Text>
                    <Text>{rosterUrl}</Text>
                </Stack>
                <Image alt={`https://image-charts.com/chart?cht=qr&chs=150x150&chl=${rosterUrl}`} src={`https://image-charts.com/chart?cht=qr&chs=150x150&chl=${rosterUrl}`} />
            </Stack>
        </>
    );
}

function MiniOperativeCard(props) {
    const { operative, index } = props;
    const [settings] = useSettings();
    return (
        <Draggable key={operative.rosteropid} index={index} draggableId={operative.rosteropid}>
            {(provided) => (
                <div
                    {...provided.dragHandleProps}
                    {...provided.draggableProps}
                    ref={provided.innerRef}
                >
                    <Paper withBorder mb="sm" p="xs" style={{ cursor: 'pointer' }}>
                        <Stack gap={5}>
                            <SimpleGrid cols={{ base: 2 }}>
                                {settings.display === "card" && <Image
                                    alt="Operative Portrait"
                                    fit="cover"
                                    style={{ objectPosition: "top", height: '100%', maxHeight: '200px' }}
                                    radius="sm"
                                    src={operative.rosteropid ? `${API_PATH}/operativeportrait.php?roid=${operative.rosteropid}` : `https://ktdash.app/img/portraits/${operative.factionid}/${operative.killteamid}/${operative.fireteamid}/${operative.opid}.jpg`}
                                />}
                                <Stack gap={5}>
                                    <Title textWrap="pretty" order={4}>{settings.opnamefirst === "y" ? operative.opname : operative.optype || operative.opname}</Title>
                                    <Text>{(settings.opnamefirst === "y" || !operative.optype) ? operative.optype : operative.opname}</Text>
                                    <Group gap={5}>
                                        {operative.weapons.map((weapon, index) => (
                                            <Text key={index} size="sm">
                                                {weapon.weptype === "M" ?
                                                    <IconSwords size={15} /> : <IconCrosshair size={15} />}
                                                <span style={{ marginLeft: '5px' }}>{weapon.wepname}</span>
                                            </Text>
                                        ))}
                                    </Group>
                                </Stack>
                            </SimpleGrid>
                        </Stack>
                    </Paper>
                </div>
            )}
        </Draggable>

    );
}

export function OrderOperativesModal(props) {
    const { onClose = () => { }, roster } = props;
    const [state, handlers] = useListState(roster.operatives || []);

    const handleUpdateRoster = () => {
        const newOps = state.map((op, index) => ({
            ...op,
            seq: index
        }));
        onClose(newOps);
        modals.close("order-operatives");
    };

    const items = state.map((operative, index) => (
        <MiniOperativeCard key={index} index={index} operative={operative} draggableId={operative.rosteropid} />
    ))
    return (
        <>
            <Stack>
                <DragDropContext
                    onDragEnd={({ destination, source }) =>
                        handlers.reorder({ from: source.index, to: destination?.index || 0 })
                    }
                >
                    <Droppable droppableId="dnd-list" direction="vertical">
                        {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef}>
                                {items}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
                <Group justify="flex-end">
                    <Button variant="default" onClick={() => modals.close("order-operatives")}>Cancel</Button>
                    <Button type="submit" onClick={() => handleUpdateRoster()}>Save</Button>
                </Group>
            </Stack>
        </>
    );
}


export function UpdateRosterPotraitModal(props) {
    const { onClose, roster } = props;

    const [portrait, setPortrait] = React.useState();

    const setFileUpload = (file) => {
        setPortrait({
            picturePreview: URL.createObjectURL(file),
            pictureAsFile: file
        })
    }

    const handleUploadRosterPortrait = () => {
        const formData = new FormData();
        formData.append(
            "file",
            portrait.pictureAsFile
        );
        request(`/rosterportrait.php?rid=${roster.rosterid}`, {
            method: "POST",
            body: formData
        }).then((data) => {
            if (data?.success) {
                notifications.show({
                    title: 'Upload Succeeded',
                    message: `Successfully uploaded roster portrait.`,
                })
                modals.close("update-portrait");
                onClose(Date.now())
            } else {
                notifications.show({
                    title: 'Upload Failed',
                    message: `${data}`,
                })
            }
        })
    };

    const handleDeleteRosterPortrait = () => {
        request(`/rosterportrait.php?rid=${roster.rosterid}`, {
            method: "DELETE"
        }).then((data) => {
            if (data?.success) {
                notifications.show({
                    title: 'Delete Succeeded',
                    message: `Successfully deleted roster portrait.`,
                })
                modals.close("update-portrait");
                onClose(Date.now())
            } else {
                notifications.show({
                    title: 'Delete Failed',
                    message: `${data}`,
                })
            }
        })
    };

    return (
        <>
            <Stack>
                <Image alt="Roster portrait" fit="cover" style={{ objectPosition: "top" }} h={300} radius="sm" src={portrait?.picturePreview || `${API_PATH}/rosterportrait.php?rid=${roster.rosterid}`} />
                <FileInput
                    leftSection={<IconPhoto />}
                    label="Roster Portrait"
                    placeholder="Upload Image"
                    value={portrait?.pictureAsFile}
                    onChange={setFileUpload}
                />
                <Group justify="flex-end">
                    <Button variant="default" onClick={() => modals.close("update-portrait")}>Cancel</Button>
                    <Button color="red" onClick={handleDeleteRosterPortrait}>Delete Portrait</Button>
                    <Button type="submit" onClick={handleUploadRosterPortrait}>Save</Button>
                </Group>
            </Stack>
        </>
    );
}

export function UpdateRosterModal(props) {
    const { onClose, roster } = props;
    const { user } = useAuth_deprecated();
    const form = useForm({
        mode: 'controlled',
        initialValues: {
            rostername: roster.rostername,
            notes: roster.notes,
            portraitcopyok: roster.portraitcopyok ? true : false,
        },
        validate: {
            rostername: (value) => (!value ? 'Roster must have a name' : null)
        },
    });

    const handleUpdateRoster = form.onSubmit((values) => {
        const newRoster = {
            "userid": user.userid,
            "rosterid": roster.rosterid,
            "rostername": values.rostername,
            "factionid": roster.factionid,
            "killteamid": roster.killteamid,
            "seq": 1,
            "notes": values.notes,
            "CP": roster.CP,
            "TP": roster.TP,
            "VP": roster.VP,
            "RP": roster.RP,
            "ployids": roster.ployids,
            "portraitcopyok": values.portraitcopyok ? 1 : 0,
            "keyword": roster.keyword
        };
        onClose(newRoster);
        modals.close("update-details");
    });

    return (
        <>
            <form
                onSubmit={handleUpdateRoster}
            >
                <Stack>
                    <TextInput
                        label="Roster Name"
                        placeholder="Roster Name"
                        key={form.key('rostername')}
                        {...form.getInputProps('rostername')}
                    />
                    <Textarea
                        rows={8}
                        label="Notes"
                        placeholder="Notes"
                        key={form.key('notes')}
                        {...form.getInputProps('notes')}
                    />
                    <Checkbox
                        clearable
                        label="Copy portraits when imported by other users"
                        key={form.key('portraitcopyok')}
                        {...form.getInputProps('portraitcopyok', { type: 'checkbox' })}
                    />
                    <Group justify="flex-end">
                        <Button variant="default" onClick={() => modals.close("update-details")}>Cancel</Button>
                        <Button type="submit">Save</Button>
                    </Group>
                </Stack>
            </form>
        </>
    );
}

const Weapon = (props) => {
    const { weapon, checked, onCheck = () => { } } = props;
    if (weapon?.profiles?.length > 1) {
        return (
            <>
                {weapon.profiles.length > 1 && <Table.Tr key={weapon.wepid}>
                    <Table.Td style={{ width: '30px' }}>
                        <Checkbox
                            checked={checked}
                            onChange={(event) => onCheck(weapon.wepid, event.currentTarget.checked)}
                        />
                    </Table.Td>
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
                        <Table.Td />
                        <Table.Td>- {profile.name} <span role="button" style={{ textDecoration: 'underline', cursor: 'pointer', userSelect: 'none' }}>
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
                <Table.Td style={{ width: '30px' }}>
                    <Checkbox
                        checked={checked}
                        onChange={(event) => onCheck(weapon.wepid, event.currentTarget.checked)}
                    />
                </Table.Td>
                <Table.Td>
                    <span>
                        {weapon.weptype === "M" ?
                            <IconSwords color="var(--mantine-color-orange-8)" size={20} /> : <IconCrosshair color="var(--mantine-color-orange-8)" size={20} />}
                        <span style={{ marginLeft: '5px' }}>
                            {weapon.wepname} <span role="button" style={{ textDecoration: 'underline', cursor: 'pointer' }}>
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

export function OperativeModal(props) {
    const { onClose, roster, operative: existingOperative } = props;
    const { width } = useWindowDimensions();
    const modalId = existingOperative ? 'edit-operative' : 'add-operative';
    const [settings] = useSettings();
    const [operativeData, setOperativeData] = React.useState(existingOperative);
    const [operativeId, setOperativeId] = React.useState(existingOperative?.opid);
    const [fireteamId, setFireteamId] = React.useState(existingOperative?.fireteamid);
    const { data: killteam, isLoading: isFetchingTeam } = useSWR([`/killteam.php`, roster.factionid, roster.killteamid], fetchKillteam);
    const fireteams = keyBy(killteam?.fireteams.map((fireteam) => ({ ...fireteam, operatives: keyBy(fireteam?.operatives, 'opid') })), 'fireteamid');
    const fireteamOptions = killteam?.fireteams?.map((fireteam) => ({
        label: fireteam.fireteamname,
        value: fireteam.fireteamid
    }));
    const getOperative = (fireteamId, operativeId) => {
        if (!fireteamId) {
            fireteamId = Object.keys(fireteams)?.[0];
        }
        return fireteams?.[fireteamId]?.operatives?.[operativeId]
    }
    const operativeOptions = Object.values((fireteams[fireteamId] ?? Object.values(fireteams)?.[0])?.operatives ?? {})?.map((operative) => ({
        label: operative.opname,
        value: operative.opid
    }));
    const hiddenKT24Equipment = new Set(['Equipment', 'Universal Equipment']);
    const hiddenNarrativeEquipment = new Set(['Battle Honour', 'Battle Scar', 'Rare Equipment']);

    const getRandomOperativeName = (opData) => requestText(`/name.php?factionid=${opData.factionid}&killteamid=${opData.killteamid}&fireteamid=${opData.fireteamid}&opid=${opData.opid}`);

    const setInitialOperativeData = async (opId) => {
        setOperativeId(opId);
        let newOpData = {
            ...getOperative(fireteamId, opId),
            weapons: [...getOperative(fireteamId, opId)?.weapons?.filter((weapon) => !!weapon.isdefault)]
        };
        if (settings.useoptypeasname !== "y") {
            newOpData.opname = await getRandomOperativeName(newOpData);
        }
        setOperativeData(newOpData);
    }

    const randomizeOperativeName = async () => {
        if (!operativeData) {
            return;
        }

        const randomName = await getRandomOperativeName(operativeData);

        if (randomName) {
            setOperativeData({
                ...operativeData,
                opname: randomName
            })
        }
    }

    const filterEquipment = (equipCategory) => {
        if (killteam?.edition === "kt24") {
            return !hiddenKT24Equipment.has(equipCategory)
        } else if (settings.shownarrative !== "y") {
            return !hiddenNarrativeEquipment.has(equipCategory)
        } else {
            return true;
        }
    }

    const equipment = groupBy(roster?.killteam?.equipments, 'eqcategory');

    // Unmodified original operative data
    const operative = getOperative(fireteamId, operativeId);

    const validateSelection = () => {
        return !!operativeData && !!operativeData?.opname;
    }

    const handleConfirmOperative = ((e) => {
        e.preventDefault();
        onClose(operativeData);
        modals.close(modalId)
    });

    if (isFetchingTeam) {
        return (<Box h={300}><LoadingOverlay zIndex={1000} visible={isFetchingTeam} /></Box>);
    }

    if (!killteam) {
        return;
    }

    return (
        <>
            <form
                onSubmit={handleConfirmOperative}
            >
                <Stack>
                    {(!existingOperative && Object.keys(fireteams)?.length > 1) && <Select
                        disabled={!killteam?.killteamid}
                        allowDeselect={false}
                        label="Select Fireteam"
                        placeholder="Select Fireteam"
                        data={fireteamOptions}
                        value={fireteamId}
                        onChange={(fireteamId) => {
                            setFireteamId(fireteamId);
                            setOperativeId(null);
                            setOperativeData(null);
                        }}
                    />}
                    {!existingOperative && <Select
                        disabled={!killteam?.killteamid}
                        allowDeselect={false}
                        label="Select Operative"
                        placeholder="Select Operative"
                        data={operativeOptions}
                        value={operativeId}
                        onChange={(operativeId) => {
                            setInitialOperativeData(operativeId);
                        }}
                    />}
                    <TextInput
                        disabled={!operativeId}
                        label="Operative Name"
                        placeholder="Operative Name"
                        rightSection={settings.useoptypeasname === "y" ? <></> : <ActionIcon onClick={() => randomizeOperativeName()}><IconRefresh /></ActionIcon>}
                        value={operativeData?.opname || ''}
                        onChange={(e) => {
                            setOperativeData({
                                ...operativeData,
                                opname: e.target.value
                            })
                        }}
                    />
                    {!!operative && <SimpleGrid cols={{ base: operative?.edition === "kt21" ? 6 : 4 }} spacing="xs">
                        <Paper withBorder><Stack justify="center" align="center" gap="xs"><Text fw={700}>APL</Text><Group gap={2}><IconTriangleInverted color="var(--mantine-color-orange-8)" size={20} /><Text fw={700}>{operative.APL}</Text></Group></Stack></Paper>
                        <Paper withBorder><Stack justify="center" align="center" gap="xs"><Text fw={700}>MOVE</Text> <Group gap={0}>{operative?.edition !== "kt21" && <IconArrowBigRight color="var(--mantine-color-orange-8)" size={20} />}<Text fw={700}><span dangerouslySetInnerHTML={{ __html: `${convertShapes(operative.M)}` }} /></Text></Group></Stack></Paper>
                        {operative?.edition === "kt21" && <Paper withBorder><Stack justify="center" align="center" gap="xs"><Text fw={700}>GA</Text> <Group gap={2}><IconUser color="var(--mantine-color-orange-8)" size={20} /><Text fw={700}>{operative.GA}</Text></Group></Stack></Paper>}
                        {operative?.edition === "kt21" && <Paper withBorder><Stack justify="center" align="center" gap="xs"><Text fw={700}>DF</Text> <Group gap={2}><IconDice color="var(--mantine-color-orange-8)" size={20} /><Text fw={700}>{operative.DF}</Text></Group></Stack></Paper>}
                        <Paper withBorder><Stack justify="center" align="center" gap="xs"><Text fw={700}>SAVE</Text> <Group gap={2}><IconShield color="var(--mantine-color-orange-8)" size={20} /><Text fw={700}>{operative.SV}</Text></Group></Stack></Paper>
                        <Paper withBorder><Stack justify="center" align="center" gap="xs">
                            <Text fw={700}>WOUND</Text>
                            <Group gap={2}>{operative?.edition !== "kt21" && <IconDroplet color="var(--mantine-color-orange-8)" size={20} />}<Text fw={700}>{operative.W}</Text></Group>
                        </Stack></Paper>
                    </SimpleGrid>}
                    {!!operative && <Table horizontalSpacing={2} style={{ fontSize: '14px', marginLeft: '-2px' }}>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th />
                                <Table.Th>WEAPONS</Table.Th>
                                <Table.Th style={{ textAlign: 'center' }}>ATK</Table.Th>
                                <Table.Th style={{ textAlign: 'center' }}>HIT</Table.Th>
                                <Table.Th style={{ textAlign: 'center' }}>DMG</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {operative?.weapons?.map((weapon, index) => (
                                <Weapon
                                    key={index}
                                    weapon={weapon}
                                    checked={!!operativeData?.weapons?.filter((wep) => wep.wepid === weapon.wepid)?.length}
                                    onCheck={(weaponid, active) => {
                                        if (active) {
                                            setOperativeData({
                                                ...operativeData,
                                                weapons: [...operativeData?.weapons, ...operative?.weapons?.filter((wep) => wep.wepid === weaponid)]
                                            })
                                        } else {
                                            setOperativeData({
                                                ...operativeData,
                                                weapons: [...operativeData?.weapons?.filter((wep) => wep.wepid !== weaponid)]
                                            })
                                        }
                                    }}
                                />
                            ))}
                        </Table.Tbody>
                    </Table>}
                    {!!equipment && <>
                        {Object.keys(equipment).filter(filterEquipment).map((eqCategory) => {
                            const equips = equipment[eqCategory];
                            return (
                                <>
                                    <Text>{eqCategory}</Text>
                                    <SimpleGrid cols={{ base: 2, sm: 4 }}>
                                        {equips?.map((eq, index) => (
                                            <Flex key={index} justify="space-between" align="center">
                                                <Checkbox
                                                    display="inline-block"
                                                    checked={!!operativeData?.equipments?.filter((equip) => equip.eqid === eq.eqid)?.length}
                                                    onChange={(event) => {
                                                        if (event.target.checked) {
                                                            setOperativeData({
                                                                ...operativeData,
                                                                equipments: [...(operativeData?.equipments || []), eq]
                                                            })
                                                        } else {
                                                            setOperativeData({
                                                                ...operativeData,
                                                                equipments: [...operativeData?.equipments?.filter((operativeeq) => operativeeq.eqid !== eq.eqid)]
                                                            })
                                                        }
                                                    }}
                                                    label={eq.eqname}

                                                />
                                                <Popover withArrow position="top">
                                                    <Popover.Target>
                                                        <ActionIcon display="inline" variant="subtle" color="white"><IconHelp /></ActionIcon>
                                                    </Popover.Target>
                                                    <Popover.Dropdown p="xs">
                                                        <ScrollArea.Autosize mah={200} maw={Math.min(width - 30, 500)}>
                                                            <Title order={5}>{eq.eqname}</Title>
                                                            <Text size="sm">
                                                                <div dangerouslySetInnerHTML={{ __html: `${convertShapes(eq.eqdescription)}` }} />
                                                            </Text>
                                                        </ScrollArea.Autosize>
                                                    </Popover.Dropdown>
                                                </Popover>
                                            </Flex>
                                        ))}
                                    </SimpleGrid>
                                </>
                            )
                        })}
                    </>}
                    <Group justify="flex-end">
                        <Button variant="default" onClick={() => modals.close(modalId)}>Cancel</Button>
                        <Button type="submit" disabled={!validateSelection()}>{existingOperative ? 'Update' : 'Add'}</Button>
                    </Group>
                </Stack>
            </form>
        </>
    );
}
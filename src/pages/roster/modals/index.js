import { TextInput, Stack, Button, Group, Select, Table, SimpleGrid, Text, Checkbox, Textarea } from '@mantine/core';
import { useRequest } from '../../../hooks/use-api';
import { modals } from '@mantine/modals';
import React from 'react';
import { flatten } from 'lodash';
import { convertShapes } from '../../../utils/shapes';
import { IconArrowForward, IconCrosshair, IconDice, IconDroplet, IconShield, IconSwords, IconTriangleInverted, IconUser } from '@tabler/icons-react';
import useAuth from '../../../hooks/use-auth';
import { useForm } from '@mantine/form';

export function UpdateRosterModal(props) {
    const { onClose, roster } = props;
    const { user } = useAuth();
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
                    <Table.Td>
                        <Checkbox
                            checked={checked}
                            onChange={(event) => onCheck(weapon.wepid, event.currentTarget.checked)}
                        />
                    </Table.Td>
                    <Table.Td>
                        <Group wrap="nowrap" gap="sm">
                            {weapon.weptype === "M" ?
                                <IconSwords size={20} /> : <IconCrosshair size={20} />}
                            {weapon.wepname}
                        </Group>
                    </Table.Td>
                </Table.Tr>}
                {weapon.profiles.map((profile) => (
                    <Table.Tr key={profile.profileid}>
                        <Table.Td />
                        <Table.Td>- {profile.name} <span role="button" style={{ textDecoration: 'underline', cursor: 'pointer', userSelect: 'none' }}>
                            {profile.SR ? <span dangerouslySetInnerHTML={{ __html: `(${convertShapes(profile.SR)})` }} /> : ''}
                        </span>
                        </Table.Td>
                        <Table.Td>{profile.A}</Table.Td>
                        <Table.Td>{profile.BS}</Table.Td>
                        <Table.Td>{profile.D}</Table.Td>
                    </Table.Tr>
                ))}
            </>
        )
    }
    return (
        <>
            <Table.Tr key={weapon.wepid}>
                <Table.Td>
                    <Checkbox
                        checked={checked}
                        onChange={(event) => onCheck(weapon.wepid, event.currentTarget.checked)}
                    />
                </Table.Td>
                <Table.Td>
                    <Group wrap="nowrap" gap="sm">
                        {weapon.weptype === "M" ?
                            <IconSwords size={20} /> : <IconCrosshair size={20} />}
                        <span>
                            {weapon.wepname} <span role="button" style={{ textDecoration: 'underline', cursor: 'pointer' }}>
                                {weapon.profiles[0].SR ? <span dangerouslySetInnerHTML={{ __html: `(${convertShapes(weapon.profiles[0].SR)})` }} /> : ''}
                            </span>
                        </span>
                    </Group>
                </Table.Td>
                <Table.Td>{weapon.profiles[0].A}</Table.Td>
                <Table.Td>{weapon.profiles[0].BS}</Table.Td>
                <Table.Td>{weapon.profiles[0].D}</Table.Td>
            </Table.Tr>
        </>
    )
}

export function AddOperativeModal(props) {
    const { onClose, roster } = props;
    const [operativeData, setOperativeData] = React.useState(null);
    const [operativeId, setOperativeId] = React.useState(null);
    const { data: killteam } = useRequest(`/killteam.php?fa=${roster?.factionid}&kt=${roster?.killteamid}`);
    const operatives = flatten(killteam?.fireteams.map((fireteam) => fireteam.operatives));
    const operativeOptions = operatives?.map((operative, index) => ({
        label: operative.opname,
        value: index.toString()
    }));

    // Unmodified original operative data
    const operative = operatives[operativeId];

    const validateSelection = () => {
        return !!operativeData && !!operativeData?.opname;
    }

    const handleAddOperative = ((e) => {
        e.preventDefault();
        onClose(operativeData);
        modals.close("add-operative")
    });

    return (
        <>
            <form
                style={{ overflow: 'auto' }}
                onSubmit={handleAddOperative}
            >
                <Stack>
                    <Select
                        label="Select Operative"
                        placeholder="Select Operative"
                        data={operativeOptions}
                        value={operativeId}
                        onChange={(operativeId) => {
                            setOperativeId(operativeId)
                            setOperativeData({
                                ...operatives[operativeId],
                                weapons: []
                            });
                        }}
                    />
                    <TextInput
                        label="Operative Name"
                        placeholder="Operative Name"
                        value={operativeData?.opname}
                        onChange={(e) => {
                            setOperativeData({
                                ...operativeData,
                                opname: e.target.value
                            })
                        }}
                    />
                    {!!operative && <SimpleGrid cols={{ base: operative?.edition === "kt21" ? 6 : 4 }} spacing="sm">
                        <Stack justify="center" align="center" gap="xs"><Text fw={700}>APL</Text><Group gap={2}><IconTriangleInverted size={20} />{operative.APL}</Group></Stack>
                        <Stack justify="center" align="center" gap="xs"><Text fw={700}>MOVE</Text> <Group gap={0}>{operative?.edition !== "kt21" && <IconArrowForward size={20} />}<span dangerouslySetInnerHTML={{ __html: `${convertShapes(operative.M)}` }} /></Group></Stack>
                        {operative?.edition === "kt21" && <Stack justify="center" align="center" gap="xs"><Text fw={700}>GA</Text> <Group gap={2}><IconUser size={20} />{operative.GA}</Group></Stack>}
                        {operative?.edition === "kt21" && <Stack justify="center" align="center" gap="xs"><Text fw={700}>DF</Text> <Group gap={2}><IconDice size={20} />{operative.DF}</Group></Stack>}
                        <Stack justify="center" align="center" gap="xs"><Text fw={700}>SAVE</Text> <Group gap={2}><IconShield size={20} />{operative.SV}</Group></Stack>
                        <Stack justify="center" align="center" gap="xs"><Text fw={700}>WOUND</Text> <Group gap={2}><IconDroplet size={20} />{operative.W}</Group></Stack>
                    </SimpleGrid>}
                    {!!operative && <Table horizontalSpacing="xs">
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th />
                                <Table.Th>NAME</Table.Th>
                                <Table.Th>ATK</Table.Th>
                                <Table.Th>HIT</Table.Th>
                                <Table.Th>DMG</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {operative?.weapons?.map((weapon) => (
                                <Weapon
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
                    <Group justify="flex-end">
                        <Button variant="default" onClick={() => modals.close("add-operative")}>Cancel</Button>
                        <Button type="submit" disabled={!validateSelection()}>Add</Button>
                    </Group>
                </Stack>
            </form>
        </>
    );
}
import { TextInput, Stack, Button, Group, Select } from '@mantine/core';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import React from 'react';
import useAuth_deprecated from '../../../hooks/use-auth';
import { find, isNil } from 'lodash';
import { useSettings } from '../../../hooks/use-settings';
import useSWR from 'swr';
import { fetchFactions } from '@/hooks/use-api/fetchers';

export function AddRosterModal(props) {
    const { onClose } = props;
    const [settings] = useSettings();
    const { user } = useAuth_deprecated();
    const form = useForm({
        mode: 'controlled',
        initialValues: {
            rostername: '',
            faction: null,
            team: null,
        },
        validate: {
            rostername: (value) => (!value ? 'Roster must have a name' : null),
            faction: (value) => (!value ? 'Must select a faction' : null),
            team: (value) => (!value ? 'Must select a team' : null),
        },
    });
    const teamParams = new URLSearchParams({
        loadkts: 1,
        edition: settings.edition
    }).toString();
    const { data: factions } = useSWR(`/faction.php?${teamParams}`, !isNil(settings.edition) ? fetchFactions : null);

    React.useEffect(() => {
        form.setFieldValue('team', null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form?.getValues()?.faction]);

    const factionOptions = factions?.map((faction) => ({
        label: faction.factionname,
        value: faction.factionid
    }));

    const teamOptions = find(factions, { factionid: form?.getValues()?.faction })?.killteams?.filter(team => !team.isCustom)?.map((team) => ({
        label: `${team.killteamname} (${team.edition})`,
        value: team.killteamid
    }));

    const handleCreateRoster = form.onSubmit((values) => {
        form.reset();
        var roster = {
            "rosterid": null,
            "factionid": values.faction,
            "killteamid": values.team,
            "rostername": values.rostername,
            "portraitcopyok": 0,
            "keyword": "",
            "userid": user.userid,
            "CP": 0,
            "VP": 0
        };
        onClose(roster);
        modals.close("create-roster");
    });

    return (
        <>
            <form
                onSubmit={handleCreateRoster}
            >
                <Stack>
                    <TextInput
                        label="Roster Name"
                        placeholder="Roster Name"
                        key={form.key('rostername')}
                        {...form.getInputProps('rostername')}
                    />
                    <Select
                        label="Select Faction"
                        placeholder="Select Faction"
                        data={factionOptions}
                        key={form.key('faction')}
                        {...form.getInputProps('faction')}
                    />
                    <Select
                        clearable
                        label="Select Team"
                        placeholder="Select Faction"
                        data={teamOptions}
                        key={form.key('team')}
                        {...form.getInputProps('team')}
                    />
                    <Group justify="flex-end">
                        <Button variant="default" onClick={() => modals.close("create-roster")}>Cancel</Button>
                        <Button type="submit">Create</Button>
                    </Group>
                </Stack>
            </form>
        </>
    );
}
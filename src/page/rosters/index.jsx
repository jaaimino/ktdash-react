'use client'
import React from "react";
import { Anchor, Container, SimpleGrid, Text, Title } from "@mantine/core";
import { request } from "@/hooks/use-api";
import RosterCard from "../../components/roster-card";
import { useAppContext } from "@/hooks/app-context";
import { IconPlus, IconUsers } from "@tabler/icons-react";
import { modals } from "@mantine/modals";
import { AddRosterModal } from "./modals";
import { notifications } from "@mantine/notifications";
import { useSettings } from "@/hooks/use-settings";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import {useSession} from "next-auth/react";

export default function Rosters() {
    const router = useRouter()
    const [settings] = useSettings();
    const { data: session } = useSession();
    const { user: userData } = session;
    const params = useParams();
    const { appState, setAppState } = useAppContext();
    const username = params.user;
    const { data: user, mutate: setUser } = useSWR(`/user.php?username=${username}`, request);
    const canEdit = userData?.username === username;
    const rosters = user?.rosters ?? [];

    const handleCopyRoster = (roster) => {
        request(`/roster.php?rid=${roster.rosterid}&clone=1`, {
            method: "POST"
        }).then((data) => {
            if (data?.rosterid) {
                router.push(`/r/${data?.rosterid}`)
                notifications.show({
                    title: 'Created',
                    message: `Successfully copied ${roster.rostername}.`,
                })
            }
        })
    }

    const handleShowCreateRoster = () => {
        modals.open({
            modalId: "create-roster",
            size: "lg",
            title: <Title order={2}>Create Roster</Title>,
            children: <AddRosterModal onClose={handleCreateRoster} />
        });
    }

    const handleCreateRoster = (roster) => {
        const newRoster = {
            ...roster,
            CP: settings.startcp,
            VP: settings.startvp
        }
        request("/roster.php", {
            method: "POST",
            body: JSON.stringify(newRoster)
        }).then((data) => {
            if (data?.rosterid) {
                router.push(`/r/${data?.rosterid}`)
                notifications.show({
                    title: 'Created',
                    message: `Successfully create ${roster.rostername}.`,
                })
            }
        })
    }

    const handleDeleteRoster = (roster) => {
        request(`/roster.php?rid=${roster.rosterid}`, {
            method: "DELETE"
        }).then((data) => {
            if (data?.success) {
                notifications.show({
                    title: 'Deleted',
                    message: `Successfully deleted ${roster.rostername}.`,
                })
                setUser({
                    ...user,
                    rosters: rosters?.filter((ros) => ros.rosterid !== roster.rosterid)
                })
            }
        })
    }

    const handleConfirmDeleteRoster = (roster) => {
        modals.openConfirmModal({
            title: 'Confirm Delete',
            children: (
                <Text size="sm">
                    Are you sure you want to delete {roster.rostername}?
                </Text>
            ),
            labels: { confirm: 'Confirm', cancel: 'Cancel' },
            onConfirm: () => handleDeleteRoster(roster),
        });
    };

    const handleDeployRoster = (rosterid) => {
        router.push(`/r/${rosterid}/dashboard`)
    }

    React.useEffect(() => {
        setAppState({
            ...appState,
            contextActions: [
                ...(canEdit ? [{
                    icon: <IconPlus />,
                    text: "Create",
                    onClick: () => handleShowCreateRoster()
                }] : []),
                {
                    icon: <IconUsers />,
                    text: "Pre-Built Rosters",
                    onClick: () => router.push('/u/KTDash')
                }
            ]
        });
        return () => {
            setAppState({
                ...appState,
                contextActions: []
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canEdit]);

    const cards = rosters?.map((roster, index) => (
        <RosterCard key={index} editable={canEdit} onCopy={(roster) => {
            modals.openConfirmModal({
                title: 'Confirm Copy',
                children: (
                    <Text size="sm">
                        Are you sure you want make a copy of {roster.rostername}?
                    </Text>
                ),
                labels: { confirm: 'Confirm', cancel: 'Cancel' },
                onConfirm: () => handleCopyRoster(roster),
            });
        }} roster={roster} onDelete={handleConfirmDeleteRoster} onDeploy={handleDeployRoster} />
    ));
    if (!rosters?.length) {
        return (
            <Container py="md" px="md" fluid>
                You currently have no rosters. Click <Anchor onClick={handleShowCreateRoster}>here</Anchor> to create one.
            </Container>
        )
    }

    return (
        <Container py="md" px="md" fluid>
            <SimpleGrid cols={{ base: 1, md: 2, lg: 3, xl: 4 }}>
                {cards}
            </SimpleGrid>
        </Container>
    );
}

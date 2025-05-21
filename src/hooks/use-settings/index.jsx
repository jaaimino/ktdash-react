import { useLocalStorage } from "@mantine/hooks";

export const DEFAULT_SETTINGS = {
    "display": "card",
    "showopseq": "n",
    "startvp": "2",
    "startcp": "2",
    "applyeqmods": "n",
    "hideappliedeqmods": "n",
    "shownarrative": "n",
    "autoinccp": "n",
    "defaultoporder": "engage",
    "showopid": "n",
    "useoptypeasname": "n",
    "closequarters": "n",
    "opnamefirst": "y",
    "useOperativeState": "n",
    "edition": ""
};

export function useSettings() {
    return useLocalStorage({ key: 'settings', defaultValue: DEFAULT_SETTINGS });
}

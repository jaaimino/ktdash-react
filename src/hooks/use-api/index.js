import { isNil } from "lodash";
import React from "react";

export const API_PATH = "https://ktdash.app/api";

export function useAPI() {
    const request = (endpoint, content) => {
        return fetch(`${API_PATH}${endpoint}`, {
            credentials: "include",
            method: "GET",
            ...content
        }).then(response => response.json()).catch(e => console.log(e));
    }
    return { request }
}

export function useRequest(endpoint, content, fetchCondition) {
    const [data, setData] = React.useState(null);
    const [error, setError] = React.useState(null);
    const [isFetching, setIsFetching] = React.useState(false);
    const api = useAPI();
    React.useEffect(() => {
        if (!isNil(fetchCondition) && !fetchCondition) {
            return;
        }
        setIsFetching(true);
        api.request(endpoint, content).then((data) => {
            setData(data);
            setIsFetching(false);
        }).catch((e) => {
            setError(e);
            setIsFetching(false);
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [endpoint]);
    return { data, error, isFetching, setData }
}

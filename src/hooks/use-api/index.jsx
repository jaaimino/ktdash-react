export const API_PATH = "https://ktdash.app/api";

export const request = async (endpoint, content) => {
    let response = null;
    response = await fetch(`${API_PATH}${endpoint}`, {
        credentials: "include",
        method: "GET",
        ...content
    });
    if (response.status !== 200) {
        throw new Error(response.statusText);
    }
    response = await response.json();
    return response;
}

export const requestJSON = async (endpoint, content) => {
    let response = null;
    try {
        response = await fetch(`${API_PATH}${endpoint}`, {
            credentials: "include",
            method: "GET",
            ...content
        });
        if (response.status !== 200) {
            return response.statusText;
        }
        response = await response.json();
    } catch (error) {
        return error;
    }
    return response;
}

export const requestText = async (endpoint, content) => {
    let response = null;
    try {
        response = await fetch(`${API_PATH}${endpoint}`, {
            credentials: "include",
            method: "GET",
            ...content
        });
        if (response.status !== 200) {
            return response.statusText;
        }
        response = await response.text();
    } catch (error) {
        return error;
    }
    return response;
}


import {
    useEffect,
    useState
} from "react";

import {
    getCurrentUser
} from "../utils/storage";

import {
    getBaseUrl
} from "../utils/api";

import {
    useServerStatus
} from "../context/ServerContext";

export default function
useFolders() {

    const [
        folders,
        setFolders
    ] =
        useState([]);

    const [
        loading,
        setLoading
    ] =
        useState(true);

    const {
        serverOnline,
        serverChecked
    } =
        useServerStatus();

    async function
    loadFolders() {

        if (
            !serverChecked
        ) {
            return;
        }

        if (
            !serverOnline
        ) {

            setLoading(
                false
            );

            return;
        }

        try {

            setLoading(
                true
            );

            const user =
                await
                getCurrentUser();

            if (
                !user
            ) {

                setFolders(
                    []
                );

                return;
            }

            const baseUrl =
                await
                getBaseUrl();

            const response =
                await fetch(
                    `${baseUrl}/folders/${user.id}`
                );

            const data =
                await response.json();

            setFolders(
                data
            );

        } catch (
            error
        ) {

            console.error(
                "Load folders error:",
                error
            );

        } finally {

            setLoading(
                false
            );
        }
    }

    useEffect(() => {

        if (
            serverOnline
        ) {

            loadFolders();
        }

    }, [
        serverOnline,
        serverChecked
    ]);

    return {

        folders,

        setFolders,

        reloadFolders:
            loadFolders,

        loading,
    };
}
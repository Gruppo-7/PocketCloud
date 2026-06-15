import { useEffect, useState, useCallback } from "react";

import { getCurrentUser } from "../utils/storage";

import { getBaseUrl } from "../utils/api";

import { useServerStatus } from "../context/ServerContext";

export default function
    useFiles(endpoint) {

    const [files, setFiles] = useState([]);

    const [loading, setLoading] = useState(true);

    const { serverOnline, serverChecked } = useServerStatus();

    const loadFiles =
        useCallback(
            async () => {

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
                        await getCurrentUser();

                    if (
                        !user
                    ) {

                        setFiles([]);

                        return;
                    }

                    const baseUrl =
                        await getBaseUrl();

                    const response =
                        await fetch(
                            `${baseUrl}/${endpoint}/${user.id}`
                        );

                    const data =
                        await response.json();

                    setFiles(
                        Array.isArray(
                            data
                        )
                            ? data
                            : []
                    );

                } catch (
                error
                ) {

                    console.error(
                        `Load ${endpoint} error:`,
                        error
                    );

                } finally {

                    setLoading(
                        false
                    );
                }
            },

            [
                endpoint,
                serverOnline,
                serverChecked
            ]
        );

    useEffect(() => {

        loadFiles();

    }, [
        loadFiles
    ]);

    return {

        files,

        setFiles,

        reloadFiles:
            loadFiles,

        loading,
    };
}
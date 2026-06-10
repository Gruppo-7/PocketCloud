export function
    formatFileSize(
        bytes
    ) {

    if (
        bytes
        ===
        0
    ) {
        return "0 B";
    }

    const sizes = [
        "B",
        "KB",
        "MB",
        "GB",
    ];

    const index =
        Math.floor(
            Math.log(
                bytes
            )
            /
            Math.log(
                1024
            )
        );

    return `${(
        bytes
        /
        Math.pow(
            1024,
            index
        )
    ).toFixed(2)} ${sizes[
    index
    ]
        }`;
}

export function
    formatDate(
        date
    ) {

    if (
        !date
    ) {
        return "-";
    }

    return new Date(
        date
    )
        .toLocaleString(
            "it-IT",
            {
                day:
                    "2-digit",

                month:
                    "2-digit",

                year:
                    "numeric",

                hour:
                    "2-digit",

                minute:
                    "2-digit",
            }
        )
        .replace(
            ",",
            ""
        );
}
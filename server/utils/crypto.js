import * as Crypto
    from "expo-crypto";

const PBKDF2_ITERATIONS =
    100000;

const KEY_LENGTH =
    32;

export async function
    generateSalt() {

    const bytes =
        await Crypto
            .getRandomBytesAsync(
                16
            );

    return Buffer
        .from(
            bytes
        )
        .toString(
            "base64"
        );
}

export async function
    generateFileKey() {

    const bytes =
        await Crypto
            .getRandomBytesAsync(
                32
            );

    return Buffer
        .from(
            bytes
        )
        .toString(
            "base64"
        );
}

export async function
    generateIV() {

    const bytes =
        await Crypto
            .getRandomBytesAsync(
                12
            );

    return Buffer
        .from(
            bytes
        )
        .toString(
            "base64"
        );
}
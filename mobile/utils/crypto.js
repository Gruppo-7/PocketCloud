import * as Crypto from "expo-crypto";
import CryptoJS from "crypto-js";
import { Buffer } from "buffer";
import * as FileSystem from "expo-file-system/legacy";

const PBKDF2_ITERATIONS =
    20000;

const KEY_LENGTH =
    256;

export async function
    generateFileHash(
        uri
    ) {

    const content =
        await FileSystem
            .readAsStringAsync(
                uri,
                {

                    encoding:
                        FileSystem
                            .EncodingType
                            .Base64,
                }
            );

    return await Crypto
        .digestStringAsync(

            Crypto
                .CryptoDigestAlgorithm
                .SHA256,

            content
        );
}

export async function
    encryptFile(
        inputUri,
        key,
        iv
    ) {

    const content =
        await FileSystem
            .readAsStringAsync(
                inputUri,
                {
                    encoding:
                        FileSystem
                            .EncodingType
                            .Base64,
                }
            );

    const encrypted =
        CryptoJS.AES.encrypt(

            content,

            CryptoJS.enc.Hex
                .parse(
                    key
                ),

            {

                iv:
                    CryptoJS.enc.Base64
                        .parse(
                            iv
                        ),

                mode:
                    CryptoJS.mode
                        .CBC,

                padding:
                    CryptoJS.pad
                        .Pkcs7,
            }
        );

    const encryptedPath =
        `${FileSystem.cacheDirectory}encrypted.tmp`;

    await FileSystem
        .writeAsStringAsync(

            encryptedPath,

            encrypted
                .ciphertext
                .toString(
                    CryptoJS
                        .enc
                        .Base64
                ),

            {

                encoding:
                    FileSystem
                        .EncodingType
                        .UTF8,
            }
        );

    return encryptedPath;
}

export async function
    decryptFile(

        encryptedUri,

        key,

        iv,

        originalName
    ) {

    try {

        if (
            !iv
        ) {

            throw new Error(
                "MISSING_IV"
            );
        }

        const encryptedContent =
            await FileSystem
                .readAsStringAsync(
                    encryptedUri,
                    {

                        encoding:
                            FileSystem
                                .EncodingType
                                .UTF8,
                    }
                );

        const cipherParams =
            CryptoJS.lib
                .CipherParams
                .create({

                    ciphertext:
                        CryptoJS.enc
                            .Base64
                            .parse(
                                encryptedContent
                            ),
                });

        const decrypted =
            CryptoJS.AES.decrypt(

                cipherParams,

                CryptoJS.enc.Hex
                    .parse(
                        key
                    ),

                {

                    iv:
                        CryptoJS.enc.Base64
                            .parse(
                                iv
                            ),

                    mode:
                        CryptoJS.mode
                            .CBC,

                    padding:
                        CryptoJS.pad
                            .Pkcs7,
                }
            );

        const decryptedContent =
            decrypted.toString(
                CryptoJS.enc.Utf8
            );

        if (
            !decryptedContent
        ) {

            throw new Error(
                "DECRYPT_FAILED"
            );
        }

        const cleanName =
            originalName
                .replace(
                    ".encrypted",
                    ""
                );

        const tempId =
            Date.now();

        const decryptedPath =
            `${FileSystem.cacheDirectory}tmp_dec_${tempId}_${cleanName}`;

        await FileSystem
            .writeAsStringAsync(

                decryptedPath,

                decryptedContent,

                {

                    encoding:
                        FileSystem
                            .EncodingType
                            .Base64,
                }
            );

        return decryptedPath;

    } catch (
    error
    ) {

        console.error(
            "Decrypt error:",
            error
        );

        throw error;
    }
}

export function
    encryptText(
        text,
        key,
        iv
    ) {

    const encrypted =
        CryptoJS.AES.encrypt(

            text,

            CryptoJS.enc.Hex.parse(
                key
            ),

            {

                iv:
                    CryptoJS.enc.Base64
                        .parse(
                            iv
                        ),

                mode:
                    CryptoJS.mode.CBC,

                padding:
                    CryptoJS.pad.Pkcs7,
            }
        );

    return encrypted
        .ciphertext
        .toString(
            CryptoJS.enc.Base64
        );
}

export function
    decryptText(
        encryptedText,
        key,
        iv
    ) {

    const cipherParams =
        CryptoJS.lib
            .CipherParams
            .create({

                ciphertext:
                    CryptoJS.enc.Base64
                        .parse(
                            encryptedText
                        ),
            });

    const decrypted =
        CryptoJS.AES.decrypt(

            cipherParams,

            CryptoJS.enc.Hex.parse(
                key
            ),

            {

                iv:
                    CryptoJS.enc.Base64
                        .parse(
                            iv
                        ),

                mode:
                    CryptoJS.mode.CBC,

                padding:
                    CryptoJS.pad.Pkcs7,
            }
        );

    return decrypted
        .toString(
            CryptoJS.enc.Utf8
        );
}

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
            "base64");
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
            "hex");
}

export async function
    generateIV() {

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
            "base64");
}

export async function
    scheduleTempFileCleanup(
        uri,
        delay = 30000
    ) {

    setTimeout(
        async () => {

            try {

                const fileInfo =
                    await FileSystem
                        .getInfoAsync(
                            uri
                        );

                if (
                    fileInfo.exists
                ) {

                    await FileSystem
                        .deleteAsync(
                            uri,
                            {
                                idempotent:
                                    true,
                            }
                        );

                    console.log(
                        "Temporary file deleted:",
                        uri
                    );
                }

            } catch (
            error
            ) {

                console.warn(
                    "Cleanup error:",
                    error
                );
            }

        },

        delay
    );
}

export async function
    deriveMasterKey(
        password,
        salt
    ) {

    const derived =
        CryptoJS
            .PBKDF2(

                password,

                salt,

                {

                    keySize:
                        KEY_LENGTH
                        / 32,

                    iterations:
                        PBKDF2_ITERATIONS,

                    hasher:
                        CryptoJS
                            .algo
                            .SHA256,
                }
            );

    return derived
        .toString(
            CryptoJS.enc.Hex
        );
}

export async function
    generateMasterKey() {

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
            "hex"
        );
}

export async function
    encryptMasterKey(

        masterKey,

        passwordKey
    ) {

    const ivBytes =
        await Crypto
            .getRandomBytesAsync(
                16
            );

    const ivBase64 =
        Buffer
            .from(
                ivBytes
            )
            .toString(
                "base64"
            );

    const encrypted =
        CryptoJS.AES.encrypt(

            masterKey,

            CryptoJS.enc
                .Hex
                .parse(
                    passwordKey
                ),

            {

                iv:
                    CryptoJS.enc
                        .Base64
                        .parse(
                            ivBase64
                        ),

                mode:
                    CryptoJS.mode
                        .CBC,

                padding:
                    CryptoJS.pad
                        .Pkcs7,
            }
        );

    return {

        encrypted_master_key:
            encrypted
                .ciphertext
                .toString(
                    CryptoJS.enc
                        .Base64
                ),

        encrypted_master_key_iv:
            ivBase64,
    };
}

export function
    decryptMasterKey(

        encryptedMasterKey,

        passwordKey,

        iv
    ) {

    const cipherParams =
        CryptoJS.lib
            .CipherParams
            .create({

                ciphertext:
                    CryptoJS.enc
                        .Base64
                        .parse(
                            encryptedMasterKey
                        ),
            });

    const decrypted =
        CryptoJS.AES.decrypt(

            cipherParams,

            CryptoJS.enc
                .Hex
                .parse(
                    passwordKey
                ),

            {

                iv:
                    CryptoJS.enc
                        .Base64
                        .parse(
                            iv
                        ),

                mode:
                    CryptoJS.mode
                        .CBC,

                padding:
                    CryptoJS.pad
                        .Pkcs7,
            }
        );

    return decrypted
        .toString(
            CryptoJS.enc
                .Utf8
        );
}

export async function
    cleanupTemporaryFiles() {

    try {

        const cacheDir =
            FileSystem
                .cacheDirectory;

        const files =
            await FileSystem
                .readDirectoryAsync(
                    cacheDir
                );

        const tempFiles =
            files.filter(
                file =>

                    file.startsWith(
                        "tmp_dec_"
                    )

                    ||

                    file ===
                    "encrypted.tmp"

                    ||

                    file.startsWith(
                        "decrypted."
                    )
            );

        for (
            const file
            of tempFiles
        ) {

            const fullPath =
                `${cacheDir}${file}`;

            await FileSystem
                .deleteAsync(
                    fullPath,
                    {
                        idempotent:
                            true,
                    }
                );

            console.log(
                "Cleaned temporary file:",
                file
            );
        }

    } catch (
    error
    ) {

        console.warn(
            "Temporary cleanup failed:",
            error
        );
    }
}
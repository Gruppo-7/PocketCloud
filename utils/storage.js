import AsyncStorage from "@react-native-async-storage/async-storage";

// SERVER

export async function saveServerAddress(
    address
) {

    try {

        await AsyncStorage.setItem(
            "serverAddress",
            address
        );

    } catch (error) {

        console.log(
            "Errore salvataggio server:",
            error
        );
    }
}

export async function getServerAddress() {

    try {

        return await AsyncStorage.getItem(
            "serverAddress"
        );

    } catch (error) {

        console.log(
            "Errore recupero server:",
            error
        );

        return null;
    }
}

export async function removeServerAddress() {

    try {

        await AsyncStorage.removeItem(
            "serverAddress"
        );

    } catch (error) {

        console.log(
            "Errore rimozione server:",
            error
        );
    }
}


// LOGIN

export async function saveLoginState(
    isLoggedIn
) {

    try {

        await AsyncStorage.setItem(
            "isLoggedIn",
            JSON.stringify(
                isLoggedIn
            )
        );

    } catch (error) {

        console.log(
            "Errore salvataggio login:",
            error
        );
    }
}

export async function getLoginState() {

    try {

        const value =
            await AsyncStorage.getItem(
                "isLoggedIn"
            );

        return value
            ? JSON.parse(value)
            : false;

    } catch (error) {

        console.log(
            "Errore recupero login:",
            error
        );

        return false;
    }
}

export async function logout() {

    try {

        await AsyncStorage.removeItem(
            "isLoggedIn"
        );

    } catch (error) {

        console.log(
            "Errore logout:",
            error
        );
    }
}
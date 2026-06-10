import {
  getServerAddress
} from "./storage";

export async function
getBaseUrl() {

  const server =
    await getServerAddress();

  return `http://${server}`;
}
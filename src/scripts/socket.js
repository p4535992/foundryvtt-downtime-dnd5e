import CONSTANTS from "./constants.js";
import API from "./api.js";
import { debug } from "./lib/lib.js";
import { setSocket } from "../main.js";
export let downtime5eSocket;
export function registerSocket() {
  debug("Registered downtime5eSocket");
  if (downtime5eSocket) {
    return downtime5eSocket;
  }
  //@ts-ignore
  downtime5eSocket = socketlib.registerModule(CONSTANTS.MODULE_NAME);
  // downtime5eSocket.register("XXX", (...args) => API.XXXArr(...args));
  setSocket(downtime5eSocket);
  return downtime5eSocket;
}

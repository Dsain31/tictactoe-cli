import { SystemConstants } from "./system.constants";

export default class CommonService {
  static getHostByAddress(address: string) {
    if (address && address.length > 0) {
      const splitHostAndPort = address.split(':');
      const ip = splitHostAndPort[0];
      const portNumber = splitHostAndPort[1];
      return `http://${ip}:${portNumber}`;
    } else {
      return SystemConstants.URL;
    }
  }
}
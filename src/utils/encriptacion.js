import CryptoJS from "crypto-js";
import { SECRET_KEY } from "../config.js";

/*export function setEncryptedPassword(password) {
    const encryptePassword = CryptoJS.AES.encrypt(password, SECRET_KEY).toString();
    return encryptePassword;
}*/

export function getDecryptedPassword(password){
    const encryptedPassword = password;
    if (encryptedPassword) {
      const bytes = CryptoJS.AES.decrypt(encryptedPassword, SECRET_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    }
    return null;
}
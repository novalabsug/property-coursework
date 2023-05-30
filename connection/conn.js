import mysql from "mysql2";
import Config from "../config/Config.js";

export default mysql.createConnection(Config);

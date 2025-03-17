import { configDotenv } from "dotenv";

configDotenv();

const {
    PORT = 3000,
    DB_HOST = "localhost",
    DB_PORT = "3306",
    DB_USERNAME = "username",
    DB_PASSWORD = "password",
    DB_DATABASE = "",
    ALLOWED_ORIGINS = "http://localhost:3000, http://localhost:5173",
    ALLOWED_METHODS = "GET,POST,PUT,DELETE",
    PREFIX_PATH = '',
    SYNC_DB = false
} = process.env;

const _convertToArray = (str: string) => {
    return str.split(",").map((item) => item.trim());
}

const ENV = {
    PORT,
    DB_HOST,
    DB_PORT: Number(DB_PORT),
    DB_USERNAME,
    DB_PASSWORD,
    DB_DATABASE,
    ALLOWED_ORIGINS: _convertToArray(ALLOWED_ORIGINS),
    ALLOWED_METHODS: _convertToArray(ALLOWED_METHODS),
    PREFIX_PATH,
    SYNC_DB: Boolean(SYNC_DB)
}

export default ENV;
import { config } from "dotenv";
config();

export const PORT = process.env.PORT || 4000;
export const DB_HOST = process.env.DB_HOST || "localhost";
export const DB_USER = process.env.DB_USER || "root";
export const DB_PASSWORD = process.env.DB_PASSWORD || "root";
export const DB_DATABASE = process.env.DB_DATABASE || "dentaldb";
export const DB_PORT = process.env.DB_PORT || 3306;
export const SECRET_KEY = process.env.SECRET_KEY || "123456";

export const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "123456";
export const API_KEY = process.env.CLOUDINARY_API_KEY || "123456";
export const API_SECRET_CLOUD = process.env.CLOUDINARY_API_SECRET || "123456";
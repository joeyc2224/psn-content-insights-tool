import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DB_PATH
    ? path.resolve(process.env.DB_PATH)
    : path.join(__dirname, '..', '..', 'data', 'psn.db');
export const db = new Database(dbPath, { readonly: true });

const sqlDir = path.join(__dirname, '..', 'sql');
export const queries = Object.fromEntries(
    fs.readdirSync(sqlDir)
        .filter((file) => file.endsWith('.sql'))
        .map((file) => [
            path.basename(file, '.sql'),
            fs.readFileSync(path.join(sqlDir, file), 'utf8'),
        ])
);

export const toNull = (value) => {
    if (value === undefined || value === null) return null;
    const trimmed = String(value).trim();
    return trimmed.length === 0 ? null : trimmed;
};

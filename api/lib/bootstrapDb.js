import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, '..', '..');
const dataDir = path.join(rootDir, 'data');
const schemaPath = path.join(rootDir, 'sql', 'schema.sql');

const toNull = (value) => {
    if (value === undefined || value === null) return null;
    const trimmed = String(value).trim();
    return trimmed.length === 0 ? null : trimmed;
};

const toInt = (value) => {
    const normalized = toNull(value);
    if (normalized === null) return null;
    const parsed = Number.parseInt(normalized, 10);
    return Number.isNaN(parsed) ? null : parsed;
};

const toFloat = (value) => {
    const normalized = toNull(value);
    if (normalized === null) return null;
    const parsed = Number.parseFloat(normalized);
    return Number.isNaN(parsed) ? null : parsed;
};

const readCsv = (filePath) => {
    const csv = fs.readFileSync(filePath, 'utf8');
    return parse(csv, {
        columns: true,
        skip_empty_lines: true,
        bom: true,
    });
};

const assertFile = (filePath) => {
    if (!fs.existsSync(filePath)) {
        throw new Error(`Missing required file: ${filePath}`);
    }
};

// Ensures that the database exists at the given path.
// If it does not exist, creates it and populates it with initial data.
// Returns an object indicating whether the database was created.
export const ensureDatabase = (dbPath) => {
    if (fs.existsSync(dbPath)) return { created: false };

    fs.mkdirSync(path.dirname(dbPath), { recursive: true });

    assertFile(schemaPath);
    const postsCsvPath = path.join(dataDir, 'posts.csv');
    const poststatsCsvPath = path.join(dataDir, 'poststats.csv');
    assertFile(postsCsvPath);
    assertFile(poststatsCsvPath);

    const db = new Database(dbPath);
    try {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        db.exec(schemaSql);

        const posts = readCsv(postsCsvPath);
        const poststats = readCsv(poststatsCsvPath);

        const insertPost = db.prepare(`
            INSERT INTO posts (
                post_id,
                video_id,
                account_name,
                published_at_date,
                video_url,
                video_type,
                title,
                text,
                video_length,
                thumbnail_url
            ) VALUES (
                @post_id,
                @video_id,
                @account_name,
                @published_at_date,
                @video_url,
                @video_type,
                @title,
                @text,
                @video_length,
                @thumbnail_url
            )
        `);

        const insertPoststat = db.prepare(`
            INSERT INTO poststats (
                video_id,
                data_date,
                likes,
                comments,
                shares,
                views,
                estimated_minutes_watched
            ) VALUES (
                @video_id,
                @data_date,
                @likes,
                @comments,
                @shares,
                @views,
                @estimated_minutes_watched
            )
        `);

        const insertPosts = db.transaction((rows) => {
            for (const row of rows) {
                insertPost.run({
                    post_id: toNull(row.post_id),
                    video_id: toNull(row.video_id),
                    account_name: toNull(row.account_name),
                    published_at_date: toNull(row.published_at_date),
                    video_url: toNull(row.video_url),
                    video_type: toNull(row.video_type),
                    title: toNull(row.title),
                    text: toNull(row.text),
                    video_length: toInt(row.video_length),
                    thumbnail_url: toNull(row.thumbnail_url),
                });
            }
        });

        const insertPoststats = db.transaction((rows) => {
            for (const row of rows) {
                insertPoststat.run({
                    video_id: toNull(row.video_id),
                    data_date: toNull(row.data_date),
                    likes: toInt(row.likes),
                    comments: toInt(row.comments),
                    shares: toInt(row.shares),
                    views: toInt(row.views),
                    estimated_minutes_watched: toFloat(
                        row.estimated_minutes_watched
                    ),
                });
            }
        });

        insertPosts(posts);
        insertPoststats(poststats);
    } finally {
        db.close();
    }

    return { created: true };
};

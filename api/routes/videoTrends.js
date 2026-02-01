import { Router } from 'express';
import { db, queries, toNull } from '../lib/db.js';

const router = Router();

router.get('/video-trends', (req, res) => {
    const videoIds = toNull(req.query.video_ids)
        ? req.query.video_ids
              .split(',')
              .map((value) => value.trim())
              .filter(Boolean)
        : [];

    if (videoIds.length === 0) {
        res.status(400).json({ error: 'video_ids is required' });
        return;
    }

    const params = {
        start_date: toNull(req.query.start_date),
        end_date: toNull(req.query.end_date),
    };

    const placeholders = videoIds.map((_, index) => `:video_${index}`);
    const sql = queries.video_trends.replace('{{video_ids}}', placeholders.join(', '));
    videoIds.forEach((value, index) => {
        params[`video_${index}`] = value;
    });

    const rows = db.prepare(sql).all(params);
    res.json(rows);
});

export default router;

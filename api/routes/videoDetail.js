import { Router } from 'express';
import { db, queries } from '../lib/db.js';

const router = Router();

router.get('/videos/:video_id', (req, res) => {
    const row = db.prepare(queries.video_detail).get({ video_id: req.params.video_id });
    if (!row) {
        res.status(404).json({ error: 'Video not found' });
        return;
    }
    res.json(row);
});

export default router;

import { Router } from 'express';
import { db, queries, toNull } from '../lib/db.js';

const router = Router();

router.get('/total-views', (req, res) => {
    const params = {
        account_name: toNull(req.query.account),
        video_type: toNull(req.query.video_type),
        start_date: toNull(req.query.start_date),
        end_date: toNull(req.query.end_date),
    };

    const rows = db.prepare(queries.total_views_filtered).all(params);
    res.json(rows);
});

export default router;

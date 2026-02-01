import { Router } from 'express';
import { db, queries, toNull } from '../lib/db.js';
import { applyPublishedDateFilter, isPublishedOnly } from '../lib/sqlFilters.js';

const router = Router();

router.get('/total-views', (req, res) => {
    const params = {
        account_name: toNull(req.query.account),
        video_type: toNull(req.query.video_type),
        start_date: toNull(req.query.start_date),
        end_date: toNull(req.query.end_date),
    };

    let sql = queries.total_views_filtered;
    const publishedOnly = isPublishedOnly(toNull(req.query.published_only));
    if (publishedOnly) {
        sql = applyPublishedDateFilter(sql);
    }
    const rows = db.prepare(sql).all(params);
    res.json(rows);
});

export default router;

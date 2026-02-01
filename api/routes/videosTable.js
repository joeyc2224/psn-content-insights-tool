import { Router } from 'express';
import { db, queries, toNull } from '../lib/db.js';
import { applyPublishedDateFilter, isPublishedOnly } from '../lib/sqlFilters.js';

const router = Router();

router.get('/videos-table', (req, res) => {
    const accounts = toNull(req.query.accounts)
        ? req.query.accounts
              .split(',')
              .map((value) => value.trim())
              .filter(Boolean)
        : [];

    const params = {
        start_date: toNull(req.query.start_date),
        end_date: toNull(req.query.end_date),
        video_type: toNull(req.query.video_type),
    };

    let sql = queries.videos_table;

    if (accounts.length > 0) {
        const placeholders = accounts.map((_, index) => `:account_${index}`);
        sql = sql.replace(
            'WHERE',
            `WHERE p.account_name IN (${placeholders.join(', ')}) AND`
        );
        accounts.forEach((value, index) => {
            params[`account_${index}`] = value;
        });
    }

    if (params.video_type) {
        sql = sql.replace('WHERE', 'WHERE p.video_type = :video_type AND');
    }

    if (isPublishedOnly(toNull(req.query.published_only))) {
        sql = applyPublishedDateFilter(sql);
    }

    const rows = db.prepare(sql).all(params);
    res.json(rows);
});

export default router;

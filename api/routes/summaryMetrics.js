import { Router } from 'express';
import { db, queries, toNull } from '../lib/db.js';
import { applyPublishedDateFilter, isPublishedOnly } from '../lib/sqlFilters.js';

const router = Router();

router.get('/summary', (req, res) => {
    const account = toNull(req.query.account);
    const accounts = toNull(req.query.accounts)
        ? req.query.accounts
              .split(',')
              .map((value) => value.trim())
              .filter(Boolean)
        : [];

    const params = {
        account_name: account,
        video_type: toNull(req.query.video_type),
        start_date: toNull(req.query.start_date),
        end_date: toNull(req.query.end_date),
    };
    const publishedOnly = isPublishedOnly(toNull(req.query.published_only));

    let sql = queries.summary_metrics;

    if (accounts.length > 0) {
        const placeholders = accounts.map((_, index) => `:account_${index}`);
        sql = sql.replace(
            '(:account_name IS NULL OR p.account_name = :account_name)',
            `p.account_name IN (${placeholders.join(', ')})`
        );
        accounts.forEach((value, index) => {
            params[`account_${index}`] = value;
        });
    }

    if (publishedOnly) {
        sql = applyPublishedDateFilter(sql);
    }

    const row = db.prepare(sql).get(params);
    res.json(row);
});

export default router;

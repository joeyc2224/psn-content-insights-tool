import { Router } from 'express';
import { db, queries, toNull } from '../lib/db.js';
import { isPublishedOnly } from '../lib/sqlFilters.js';

const router = Router();

const buildViewsOverTimeQuery = (groupBy) => {
    const selectCols = ['s.data_date'];
    const groupCols = ['s.data_date'];

    if (groupBy.includes('account')) {
        selectCols.push('p.account_name');
        groupCols.push('p.account_name');
    }

    if (groupBy.includes('video_type')) {
        selectCols.push('p.video_type');
        groupCols.push('p.video_type');
    }

    selectCols.push('SUM(COALESCE(s.views, 0)) AS views');

    const orderCols = [...groupCols];
    return queries.views_over_time
        .replace('{{select}}', selectCols.join(', '))
        .replace('{{group_by}}', groupCols.join(', '))
        .replace('{{order_by}}', orderCols.join(', '));
};

router.get('/views-over-time', (req, res) => {
    const rawGroupBy = toNull(req.query.group_by) || 'video_type';
    let groupBy = rawGroupBy
        .split(',')
        .map((value) => value.trim())
        .filter((value) => value === 'account' || value === 'video_type');
    if (groupBy.length === 0) {
        groupBy = ['video_type'];
    }

    const accounts = toNull(req.query.accounts)
        ? req.query.accounts
              .split(',')
              .map((value) => value.trim())
              .filter(Boolean)
        : [];

    const params = {};
    const filters = [];

    if (accounts.length > 0) {
        const placeholders = accounts.map((_, index) => `:account_${index}`);
        filters.push(`AND p.account_name IN (${placeholders.join(', ')})`);
        accounts.forEach((account, index) => {
            params[`account_${index}`] = account;
        });
    }

    const videoType = toNull(req.query.video_type);
    if (videoType) {
        filters.push('AND p.video_type = :video_type');
        params.video_type = videoType;
    }

    const startDate = toNull(req.query.start_date);
    if (startDate) {
        filters.push('AND DATE(s.data_date) >= DATE(:start_date)');
        params.start_date = startDate;
    }

    const endDate = toNull(req.query.end_date);
    if (endDate) {
        filters.push('AND DATE(s.data_date) <= DATE(:end_date)');
        params.end_date = endDate;
    }

    const publishedOnly = isPublishedOnly(toNull(req.query.published_only));
    if (publishedOnly) {
        filters.push('AND DATE(p.published_at_date) >= DATE(:start_date)');
        filters.push('AND DATE(p.published_at_date) <= DATE(:end_date)');
    }

    const sql = buildViewsOverTimeQuery(groupBy);
    const finalSql = sql.replace(
        '{{filters}}',
        filters.length ? `\n${filters.join('\n')}` : ''
    );
    const rows = db.prepare(finalSql).all(params);
    res.json(rows);
});

export default router;

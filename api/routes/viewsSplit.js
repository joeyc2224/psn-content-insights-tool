import { Router } from 'express';
import { db, queries, toNull } from '../lib/db.js';
import { isPublishedOnly } from '../lib/sqlFilters.js';

const router = Router();

const groupMap = {
    account: { select: 'p.account_name AS label', groupBy: 'p.account_name' },
    video_type: { select: 'p.video_type AS label', groupBy: 'p.video_type' },
};

router.get('/views-split', (req, res) => {
    const groupByKey = toNull(req.query.group_by) || 'video_type';
    const groupConfig = groupMap[groupByKey];

    if (!groupConfig) {
        res.status(400).json({ error: 'group_by must be account or video_type' });
        return;
    }

    const params = {};
    const filters = [];

    const accounts = toNull(req.query.accounts)
        ? req.query.accounts
              .split(',')
              .map((value) => value.trim())
              .filter(Boolean)
        : [];
    if (accounts.length > 0) {
        const placeholders = accounts.map((_, index) => `:account_${index}`);
        filters.push(`AND p.account_name IN (${placeholders.join(', ')})`);
        accounts.forEach((value, index) => {
            params[`account_${index}`] = value;
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

    const includeAll = toNull(req.query.include_all) === 'true';
    if (groupByKey === 'account' && includeAll) {
        const sql = `
WITH accounts AS (
  SELECT DISTINCT TRIM(account_name) AS label
  FROM posts
  WHERE account_name IS NOT NULL AND TRIM(account_name) <> ''
)
SELECT
  a.label AS label,
  COALESCE(SUM(s.views), 0) AS views
FROM accounts a
LEFT JOIN posts p ON TRIM(p.account_name) = a.label
LEFT JOIN poststats s ON s.video_id = p.video_id
  ${startDate ? 'AND DATE(s.data_date) >= DATE(:start_date)' : ''}
  ${endDate ? 'AND DATE(s.data_date) <= DATE(:end_date)' : ''}
WHERE 1=1
  ${publishedOnly ? 'AND DATE(p.published_at_date) >= DATE(:start_date)' : ''}
  ${publishedOnly ? 'AND DATE(p.published_at_date) <= DATE(:end_date)' : ''}
GROUP BY a.label
ORDER BY views DESC;
`;
        const rows = db.prepare(sql).all(params);
        res.json(rows);
        return;
    }

    const sql = queries.views_split
        .replace('{{group_select}}', groupConfig.select)
        .replace('{{group_by}}', groupConfig.groupBy)
        .replace('{{filters}}', filters.length ? `\n${filters.join('\n')}` : '');

    const rows = db.prepare(sql).all(params);
    res.json(rows);
});

export default router;

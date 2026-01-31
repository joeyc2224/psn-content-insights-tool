import { Router } from 'express';
import { db, queries, toNull } from '../lib/db.js';

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

    const account = toNull(req.query.account);
    if (account) {
        filters.push('AND p.account_name = :account');
        params.account = account;
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

    const sql = queries.views_split
        .replace('{{group_select}}', groupConfig.select)
        .replace('{{group_by}}', groupConfig.groupBy)
        .replace('{{filters}}', filters.length ? `\n${filters.join('\n')}` : '');

    const rows = db.prepare(sql).all(params);
    res.json(rows);
});

export default router;

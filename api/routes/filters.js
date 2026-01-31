import { Router } from 'express';
import { db, queries } from '../lib/db.js';

const router = Router();

router.get('/filters', (req, res) => {
    const row = db.prepare(queries.filters).get();

    const accountNames = row.account_names
        ? row.account_names
              .split(',')
              .map((value) => value.trim())
              .filter(Boolean)
              .sort()
        : [];
    const videoTypes = row.video_types
        ? row.video_types
              .split(',')
              .map((value) => value.trim())
              .filter(Boolean)
              .sort()
        : [];

    res.json({
        min_data_date: row.min_data_date,
        max_data_date: row.max_data_date,
        account_names: accountNames,
        video_types: videoTypes,
    });
});

export default router;

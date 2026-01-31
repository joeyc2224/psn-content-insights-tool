import { Router } from 'express';
import { db } from '../lib/db.js';

const router = Router();

router.get('/db-check', (req, res) => {
    const row = db.prepare('SELECT 1 AS value').get();
    res.json(row);
});

export default router;

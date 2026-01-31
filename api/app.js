import express from 'express';
import filtersRouter from './routes/filters.js';
import healthRouter from './routes/health.js';
import totalViewsRouter from './routes/totalViews.js';
import videoDetailRouter from './routes/videoDetail.js';
import viewsOverTimeRouter from './routes/viewsOverTime.js';
import viewsSplitRouter from './routes/viewsSplit.js';

const app = express();

app.use(express.json());
app.use('/api', healthRouter);
app.use('/api', filtersRouter);
app.use('/api', viewsOverTimeRouter);
app.use('/api', totalViewsRouter);
app.use('/api', videoDetailRouter);
app.use('/api', viewsSplitRouter);

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
    console.log(`API running at http://localhost:${PORT}`);
});

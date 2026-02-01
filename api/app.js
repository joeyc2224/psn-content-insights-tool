import express from 'express';
import filtersRouter from './routes/filters.js';
import healthRouter from './routes/health.js';
import summaryMetricsRouter from './routes/summaryMetrics.js';
import topVideosTableRouter from './routes/topVideosTable.js';
import totalViewsRouter from './routes/totalViews.js';
import videoDetailRouter from './routes/videoDetail.js';
import videosTableRouter from './routes/videosTable.js';
import videoTrendsRouter from './routes/videoTrends.js';
import viewsOverTimeRouter from './routes/viewsOverTime.js';
import viewsSplitRouter from './routes/viewsSplit.js';

const app = express();

app.use(express.json());
app.use('/api', healthRouter);
app.use('/api', filtersRouter);
app.use('/api', viewsOverTimeRouter);
app.use('/api', summaryMetricsRouter);
app.use('/api', topVideosTableRouter);
app.use('/api', totalViewsRouter);
app.use('/api', videoDetailRouter);
app.use('/api', videosTableRouter);
app.use('/api', videoTrendsRouter);
app.use('/api', viewsSplitRouter);

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
    console.log(`API running at http://localhost:${PORT}`);
});

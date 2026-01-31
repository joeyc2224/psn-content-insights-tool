-- total views for each video sorted by views
SELECT
  p.video_id,
  p.account_name,
  p.video_type,
  p.title,
  SUM(COALESCE(s.views, 0)) AS total_views
FROM posts p
JOIN poststats s ON s.video_id = p.video_id
GROUP BY
  p.video_id, p.account_name, p.video_type, p.title
ORDER BY total_views DESC;


-- views per video type over time
SELECT
  s.data_date,
  p.video_type,
  SUM(COALESCE(s.views, 0)) AS views
FROM poststats s
JOIN posts p ON p.video_id = s.video_id
GROUP BY
  s.data_date, p.video_type
ORDER BY
  s.data_date ASC, p.video_type ASC;


-- top 5 viewed vids in the last month
WITH bounds AS (
  SELECT
    DATE(MAX(DATE(data_date)), '-27 days') AS start_date, -- use Date() so max compares dates not stringss
    MAX(DATE(data_date)) AS end_date
  FROM poststats
)
SELECT
  p.video_id,
  p.account_name,
  p.video_type,
  p.title,
  SUM(COALESCE(s.views, 0)) AS views_28d
FROM posts p
JOIN poststats s ON s.video_id = p.video_id
JOIN bounds b -- restrict to period
WHERE s.data_date BETWEEN b.start_date AND b.end_date
GROUP BY p.video_id, p.account_name, p.video_type, p.title
ORDER BY views_28d DESC
LIMIT 5;
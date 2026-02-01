WITH period_stats AS (
  SELECT
    p.video_id,
    p.title,
    p.account_name,
    p.video_type,
    p.published_at_date,
    p.thumbnail_url,
    p.video_length,
    SUM(COALESCE(s.views, 0)) AS views_period,
    SUM(COALESCE(s.likes, 0)) AS likes_period,
    SUM(COALESCE(s.comments, 0)) AS comments_period,
    SUM(COALESCE(s.shares, 0)) AS shares_period
  FROM posts p
  JOIN poststats s ON s.video_id = p.video_id
  WHERE
    (:start_date IS NULL OR DATE(s.data_date) >= DATE(:start_date))
    AND (:end_date IS NULL OR DATE(s.data_date) <= DATE(:end_date))
  GROUP BY
    p.video_id,
    p.title,
    p.account_name,
    p.video_type,
    p.published_at_date,
    p.thumbnail_url,
    p.video_length
),
all_time AS (
  SELECT
    s.video_id,
    SUM(COALESCE(s.views, 0)) AS views_total
  FROM poststats s
  GROUP BY s.video_id
)
SELECT
  ps.video_id,
  ps.title,
  ps.account_name,
  ps.video_type,
  ps.published_at_date,
  ps.thumbnail_url,
  ps.video_length,
  ps.views_period,
  ps.likes_period,
  ps.comments_period,
  ps.shares_period,
  COALESCE(at.views_total, 0) AS views_total,
  CASE
    WHEN ps.views_period > 0 THEN ROUND(ps.likes_period * 1.0 / ps.views_period, 4)
    ELSE 0
  END AS engagement_rate
FROM period_stats ps
LEFT JOIN all_time at ON at.video_id = ps.video_id;

SELECT
  COUNT(DISTINCT p.video_id) AS videos,
  COALESCE(SUM(COALESCE(s.views, 0)), 0) AS views,
  COALESCE(SUM(COALESCE(s.likes, 0)), 0) AS likes,
  COALESCE(SUM(COALESCE(s.comments, 0)), 0) AS comments,
  COALESCE(SUM(COALESCE(s.shares, 0)), 0) AS shares,
  COALESCE(SUM(COALESCE(s.estimated_minutes_watched, 0)), 0) AS minutes_watched
FROM posts p
JOIN poststats s ON s.video_id = p.video_id
WHERE
  (:account_name IS NULL OR p.account_name = :account_name)
  AND (:video_type IS NULL OR p.video_type = :video_type)
  AND (:start_date IS NULL OR DATE(s.data_date) >= DATE(:start_date))
  AND (:end_date IS NULL OR DATE(s.data_date) <= DATE(:end_date));

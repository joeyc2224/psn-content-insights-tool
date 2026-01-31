SELECT
  p.video_id,
  p.account_name,
  p.video_type,
  p.title,
  SUM(COALESCE(s.views, 0)) AS total_views
FROM posts p
JOIN poststats s ON s.video_id = p.video_id
WHERE
  (:account_name IS NULL OR p.account_name = :account_name)
  AND (:video_type IS NULL OR p.video_type = :video_type)
  AND (:start_date IS NULL OR DATE(s.data_date) >= DATE(:start_date))
  AND (:end_date IS NULL OR DATE(s.data_date) <= DATE(:end_date))
GROUP BY
  p.video_id, p.account_name, p.video_type, p.title
ORDER BY total_views DESC;

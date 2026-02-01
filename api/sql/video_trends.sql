SELECT
  s.video_id,
  s.data_date,
  SUM(COALESCE(s.views, 0)) AS views
FROM poststats s
WHERE
  s.video_id IN ({{video_ids}})
  AND (:start_date IS NULL OR DATE(s.data_date) >= DATE(:start_date))
  AND (:end_date IS NULL OR DATE(s.data_date) <= DATE(:end_date))
GROUP BY s.video_id, s.data_date
ORDER BY s.video_id, s.data_date;

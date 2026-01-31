SELECT
    p.post_id,
    p.video_id,
    p.account_name,
    p.published_at_date,
    p.video_url,
    p.video_type,
    p.title,
    p.text,
    p.video_length,
    p.thumbnail_url,
    SUM(COALESCE(s.views, 0)) AS total_views,
    SUM(COALESCE(s.likes, 0)) AS total_likes,
    SUM(COALESCE(s.comments, 0)) AS total_comments,
    SUM(COALESCE(s.shares, 0)) AS total_shares,
    SUM(COALESCE(s.estimated_minutes_watched, 0)) AS total_minutes_watched
FROM posts p
LEFT JOIN poststats s ON s.video_id = p.video_id
WHERE p.video_id = :video_id
GROUP BY
    p.post_id,
    p.video_id,
    p.account_name,
    p.published_at_date,
    p.video_url,
    p.video_type,
    p.title,
    p.text,
    p.video_length,
    p.thumbnail_url;

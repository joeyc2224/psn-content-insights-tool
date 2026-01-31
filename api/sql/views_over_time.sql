SELECT {{select}}
FROM poststats s
JOIN posts p ON p.video_id = s.video_id
WHERE 1=1
{{filters}}
GROUP BY {{group_by}}
ORDER BY {{order_by}};

SELECT
    (SELECT MIN(DATE(data_date)) FROM poststats) AS min_data_date,
    (SELECT MAX(DATE(data_date)) FROM poststats) AS max_data_date,
    (SELECT GROUP_CONCAT(DISTINCT account_name) FROM posts WHERE account_name IS NOT NULL) AS account_names,
    (SELECT GROUP_CONCAT(DISTINCT video_type) FROM posts WHERE video_type IS NOT NULL) AS video_types;

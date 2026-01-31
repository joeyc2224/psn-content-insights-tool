-- in case already exist
DROP TABLE IF EXISTS poststats;
DROP TABLE IF EXISTS posts;

-- post data
CREATE TABLE posts (
  post_id TEXT PRIMARY KEY,
  video_id TEXT NOT NULL, -- must be present!
  account_name TEXT,
  published_at_date TEXT,
  video_url TEXT,
  video_type TEXT,
  title TEXT,
  text TEXT,
  video_length INTEGER,
  thumbnail_url TEXT
);

-- poststats daily metrics
CREATE TABLE poststats (
  video_id TEXT NOT NULL, -- must be present!
  data_date TEXT NOT NULL,
  likes INTEGER,
  comments INTEGER,
  shares INTEGER,
  views INTEGER,
  estimated_minutes_watched REAL,
  PRIMARY KEY (video_id, data_date) -- no double entries for same video on a day
);

-- indexers to speed up common queries
CREATE INDEX idx_posts_video_id ON posts(video_id);
CREATE INDEX idx_posts_video_type ON posts(video_type);
CREATE INDEX idx_poststats_video_id ON poststats(video_id);
CREATE INDEX idx_poststats_date ON poststats(data_date);
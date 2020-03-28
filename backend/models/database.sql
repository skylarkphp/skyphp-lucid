-- create table category
CREATE TABLE category (
	id int(11) NOT NULL AUTO_INCREMENT,
	name varchar(64) COLLATE utf8_unicode_ci NOT NULL,
	parent_id int(11) NOT NULL DEFAULT 0,
	`usage` int(11) NOT NULL DEFAULT 0,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
ALTER TABLE category ADD INDEX (name);
ALTER TABLE category ADD INDEX (parent_id);
ALTER TABLE category ADD INDEX (`usage`);

-- create table tag
CREATE TABLE tag (
	id int(11) NOT NULL AUTO_INCREMENT,
	name varchar(64) COLLATE utf8_unicode_ci NOT NULL,
	`usage` int(11) NOT NULL DEFAULT 0,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
ALTER TABLE tag ADD INDEX (name);
ALTER TABLE tag ADD INDEX (`usage`);


-- table app add column
ALTER TABLE app ADD description text NOT NULL;
ALTER TABLE app ADD download_count int NOT NULL DEFAULT 0;
ALTER TABLE app ADD view_count int NOT NULL DEFAULT 0;
ALTER TABLE app ADD fav_count int NOT NULL DEFAULT 0;
ALTER TABLE app ADD created_at date NOT NULL;
ALTER TABLE app ADD updated_at date NOT NULL;
ALTER TABLE app ADD INDEX (download_count);
ALTER TABLE app ADD INDEX (view_count);
ALTER TABLE app ADD INDEX (fav_count);
ALTER TABLE app ADD INDEX (updated_at);

-- create table app_category
CREATE TABLE app_category (
	app_id int(11) DEFAULT NULL,
	category_id int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
ALTER TABLE app_category ADD INDEX (app_id);
ALTER TABLE app_category ADD INDEX (category_id);

-- create table app_category
CREATE TABLE app_tag (
	app_id int(11) DEFAULT NULL,
	tag_id int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
ALTER TABLE app_tag ADD INDEX (app_id);
ALTER TABLE app_tag ADD INDEX (tag_id);

-- create table app_category
CREATE TABLE app_user (
	app_id int(11) DEFAULT NULL,
	user_id int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
ALTER TABLE app_user ADD INDEX (app_id);
ALTER TABLE app_user ADD INDEX (user_id);

ALTER TABLE config ADD lastvalue text NOT NULL;
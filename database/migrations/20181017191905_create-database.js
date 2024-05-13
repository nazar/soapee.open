exports.up = function(knex) {
  return knex.raw(`
create sequence favourite_recipes_id_seq;

create sequence oils_id_seq;

create sequence recipe_oils_id_seq;

create sequence recipes_id_seq;

create sequence users_id_seq;

create sequence verifications_id_seq;

create sequence comments_id_seq;

create sequence user_notifications_id_seq;

create sequence friendships_id_seq;

create sequence feedables_id_seq;

create sequence status_updates_id_seq;

create sequence images_id_seq;

create sequence recipe_journals_id_seq;

create table favourite_recipes
(
  id         integer default nextval('favourite_recipes_id_seq' :: regclass) not null,
  user_id    integer,
  recipe_id  integer,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
);

create unique index favourite_recipes_pkey
  on favourite_recipes (id);

create index favourite_recipes_recipe_id_index
  on favourite_recipes (recipe_id);

create index favourite_recipes_user_id_index
  on favourite_recipes (user_id);

create table oils
(
  id                 integer default nextval('oils_id_seq' :: regclass) not null,
  name               varchar(255),
  version            integer,
  iodine             integer,
  ins                integer,
  sap                real,
  total_saponifiable integer,
  breakdown          jsonb,
  created_at         timestamp with time zone,
  updated_at         timestamp with time zone
);

create unique index oils_pkey
  on oils (id);

create table recipe_oils
(
  id         integer default nextval('recipe_oils_id_seq' :: regclass) not null,
  recipe_id  integer,
  oil_id     integer,
  weight     real,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
);

create unique index recipe_oils_pkey
  on recipe_oils (id);

create index recipe_oils_oil_id_index
  on recipe_oils (oil_id);

create index recipe_oils_recipe_id_index
  on recipe_oils (recipe_id);

create table recipes
(
  id          integer default nextval('recipes_id_seq' :: regclass) not null,
  user_id     integer,
  name        varchar(255),
  description text,
  notes       text,
  summary     jsonb,
  created_at  timestamp with time zone,
  updated_at  timestamp with time zone,
  visibility  smallint default 1,
  settings    jsonb
);

create unique index recipes_pkey
  on recipes (id);

create index recipes_user_id_index
  on recipes (user_id);

create table sessions
(
  sid     varchar(255) not null,
  sess    json         not null,
  expired timestamp    not null
);

create unique index sessions_pkey
  on sessions (sid);

create table users
(
  id             integer default nextval('users_id_seq' :: regclass) not null,
  name           varchar(255),
  image_url      varchar(255),
  about          text,
  last_logged_in timestamp with time zone,
  created_at     timestamp with time zone,
  updated_at     timestamp with time zone,
  email          varchar(100)
);

create unique index users_pkey
  on users (id);

create table verifications
(
  id            integer default nextval('verifications_id_seq' :: regclass) not null,
  user_id       integer,
  provider_id   varchar(255),
  provider_name varchar(255),
  hash          varchar(255),
  created_at    timestamp with time zone,
  updated_at    timestamp with time zone,
  reset_hash    varchar(255),
  reset_code    varchar(20)
);

create unique index verifications_pkey
  on verifications (id);

create index verifications_hash_index
  on verifications (hash);

create index verifications_provider_name_index
  on verifications (provider_name);

create index verifications_user_id_index
  on verifications (user_id);

create table comments
(
  id               integer default nextval('comments_id_seq' :: regclass) not null,
  user_id          integer,
  commentable_id   integer,
  commentable_type varchar(255),
  comment          text,
  created_at       timestamp with time zone,
  updated_at       timestamp with time zone
);

create unique index comments_pkey
  on comments (id);

create index comments_user_id_index
  on comments (user_id);

create index comments_commentable_id_index
  on comments (commentable_id);

create table user_notifications
(
  id                   integer default nextval('user_notifications_id_seq' :: regclass) not null,
  user_id              integer                                                          not null,
  type                 smallint                                                         not null,
  read                 boolean default false                                            not null,
  user_notifiable_id   integer,
  user_notifiable_type varchar(255),
  message              text,
  read_on              timestamp with time zone,
  created_at           timestamp with time zone,
  updated_at           timestamp with time zone
);

create unique index user_notifications_pkey
  on user_notifications (id);

create index user_notifications_user_id_index
  on user_notifications (user_id);

create index user_notifications_user_notifiable_id_index
  on user_notifications (user_notifiable_id);

create table friendships
(
  id         integer default nextval('friendships_id_seq' :: regclass) not null,
  user_id    integer                                                   not null,
  friend_id  integer                                                   not null,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
);

create unique index friendships_pkey
  on friendships (id);

create index friendships_friend_id_index
  on friendships (friend_id);

create unique index friendships_prevent_duplicate_requests
  on friendships (user_id, friend_id);

create table feedables
(
  id            integer default nextval('feedables_id_seq' :: regclass) not null,
  feedable_id   integer,
  feedable_type varchar(255),
  feedable_meta jsonb,
  created_at    timestamp with time zone,
  updated_at    timestamp with time zone
);

create unique index feedables_pkey
  on feedables (id);

create index feedables_feedable_id_index
  on feedables (feedable_id);

create table status_updates
(
  id         integer default nextval('status_updates_id_seq' :: regclass) not null,
  user_id    integer,
  update     text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
);

create unique index status_updates_pkey
  on status_updates (id);

create index status_updates_user_id_index
  on status_updates (user_id);

create table images
(
  id             integer default nextval('images_id_seq' :: regclass) not null,
  user_id        integer,
  file_name      varchar(255),
  imageable_id   integer,
  imageable_type varchar(255),
  created_at     timestamp with time zone,
  updated_at     timestamp with time zone
);

create unique index images_pkey
  on images (id);

create index images_user_id_index
  on images (user_id);

create index images_imageable_id_index
  on images (imageable_id);

create table recipe_journals
(
  id         integer default nextval('recipe_journals_id_seq' :: regclass) not null,
  recipe_id  integer,
  journal    text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
);

create unique index recipe_journals_pkey
  on recipe_journals (id);

create index recipe_journals_recipe_id_index
  on recipe_journals (recipe_id);  
  `);
};

exports.down = function(knex) {
  return knex.raw(`
    drop database soapee;
  `);
};

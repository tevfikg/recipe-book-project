-- RecipeVault — Initial Schema
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Difficulty enum
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');

-- ─── USERS ───────────────────────────────────────────────────────────────────
CREATE TABLE users (
  id                UUID PRIMARY KEY,  -- matches Supabase Auth user ID
  email             VARCHAR(255) NOT NULL UNIQUE,
  display_name      VARCHAR(255) NOT NULL,
  avatar_url        TEXT,
  bio               TEXT,
  is_premium        BOOLEAN NOT NULL DEFAULT false,
  premium_until     TIMESTAMPTZ,
  stripe_customer_id VARCHAR(255),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── RECIPES ─────────────────────────────────────────────────────────────────
CREATE TABLE recipes (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title                 VARCHAR(255) NOT NULL,
  slug                  VARCHAR(255) NOT NULL UNIQUE,
  description           TEXT NOT NULL,
  cover_photo_url       TEXT,
  cuisine               VARCHAR(100),
  difficulty            difficulty_level,
  cooking_time_minutes  INTEGER,
  base_servings         INTEGER NOT NULL DEFAULT 4,
  is_public             BOOLEAN NOT NULL DEFAULT true,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── INGREDIENTS ─────────────────────────────────────────────────────────────
CREATE TABLE ingredients (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id   UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  name        VARCHAR(255) NOT NULL,
  quantity    DECIMAL(10, 3) NOT NULL,
  unit        VARCHAR(50) NOT NULL,
  photo_url   TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

-- ─── STEPS ───────────────────────────────────────────────────────────────────
CREATE TABLE steps (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id   UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  description TEXT NOT NULL,
  photo_url   TEXT
);

-- ─── TAGS ────────────────────────────────────────────────────────────────────
CREATE TABLE tags (
  id    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name  VARCHAR(100) NOT NULL UNIQUE
);

-- ─── RECIPE_TAGS ─────────────────────────────────────────────────────────────
CREATE TABLE recipe_tags (
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  tag_id    UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (recipe_id, tag_id)
);

-- ─── BOOKMARKS ───────────────────────────────────────────────────────────────
CREATE TABLE bookmarks (
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipe_id  UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, recipe_id)
);

-- ─── INDEXES ─────────────────────────────────────────────────────────────────
CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_recipes_slug ON recipes(slug);
CREATE INDEX idx_recipes_is_public ON recipes(is_public);
CREATE INDEX idx_ingredients_recipe_id ON ingredients(recipe_id);
CREATE INDEX idx_steps_recipe_id ON steps(recipe_id);
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Users: viewable by all, editable only by self
CREATE POLICY "Users are viewable by everyone" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Recipes: public ones viewable by all; private only by owner
CREATE POLICY "Public recipes are viewable by everyone" ON recipes FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can insert own recipes" ON recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own recipes" ON recipes FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own recipes" ON recipes FOR DELETE
  USING (auth.uid() = user_id);

-- Ingredients: follow recipe visibility
CREATE POLICY "Ingredients viewable with recipe" ON ingredients FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM recipes r
    WHERE r.id = recipe_id AND (r.is_public = true OR r.user_id = auth.uid())
  ));
CREATE POLICY "Owner can manage ingredients" ON ingredients FOR ALL
  USING (EXISTS (SELECT 1 FROM recipes r WHERE r.id = recipe_id AND r.user_id = auth.uid()));

-- Steps: same as ingredients
CREATE POLICY "Steps viewable with recipe" ON steps FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM recipes r
    WHERE r.id = recipe_id AND (r.is_public = true OR r.user_id = auth.uid())
  ));
CREATE POLICY "Owner can manage steps" ON steps FOR ALL
  USING (EXISTS (SELECT 1 FROM recipes r WHERE r.id = recipe_id AND r.user_id = auth.uid()));

-- Tags: everyone can read
CREATE POLICY "Tags are viewable by everyone" ON tags FOR SELECT USING (true);

-- Recipe tags: viewable with recipe
CREATE POLICY "Recipe tags viewable with recipe" ON recipe_tags FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM recipes r
    WHERE r.id = recipe_id AND (r.is_public = true OR r.user_id = auth.uid())
  ));
CREATE POLICY "Owner can manage recipe tags" ON recipe_tags FOR ALL
  USING (EXISTS (SELECT 1 FROM recipes r WHERE r.id = recipe_id AND r.user_id = auth.uid()));

-- Bookmarks: users can only see and manage their own
CREATE POLICY "Users can view own bookmarks" ON bookmarks FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own bookmarks" ON bookmarks FOR ALL
  USING (auth.uid() = user_id);

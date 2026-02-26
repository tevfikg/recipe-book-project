-- RecipeVault — Seed Data
-- Run after migration to populate predefined tags

INSERT INTO tags (name) VALUES
  -- Dietary
  ('Vegan'),
  ('Vegetarian'),
  ('Gluten-Free'),
  ('Dairy-Free'),
  -- Meal Type
  ('Breakfast'),
  ('Lunch'),
  ('Dinner'),
  ('Snack'),
  ('Dessert'),
  -- Cuisine
  ('Italian'),
  ('Turkish'),
  ('Asian'),
  ('Mexican'),
  ('Mediterranean'),
  ('American'),
  -- Special
  ('Quick'),
  ('Beginner-Friendly'),
  ('Meal Prep')
ON CONFLICT (name) DO NOTHING;

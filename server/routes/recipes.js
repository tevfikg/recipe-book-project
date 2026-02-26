const express = require('express');
const { body } = require('express-validator');
const { supabaseAdmin } = require('../lib/supabase');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { generateRecipePDF } = require('../services/pdf');

const router = express.Router();

// Slug generator
function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') +
    '-' + Date.now().toString(36);
}

// GET /api/recipes — List public recipes with search & filters
router.get('/', optionalAuth, async (req, res) => {
  const { search, tag, difficulty, cuisine, min_time, max_time, page = 1, limit = 12 } = req.query;
  const offset = (page - 1) * limit;

  let query = supabaseAdmin
    .from('recipes')
    .select(`
      *,
      users (id, display_name, avatar_url),
      recipe_tags (tags (id, name))
    `, { count: 'exact' })
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) query = query.ilike('title', `%${search}%`);
  if (difficulty) query = query.eq('difficulty', difficulty);
  if (cuisine) query = query.ilike('cuisine', `%${cuisine}%`);
  if (min_time) query = query.gte('cooking_time_minutes', min_time);
  if (max_time) query = query.lte('cooking_time_minutes', max_time);

  const { data, error, count } = await query;

  if (error) return res.status(500).json({ error: error.message });

  // Filter by tag if provided
  let recipes = data;
  if (tag) {
    recipes = data.filter(r =>
      r.recipe_tags.some(rt => rt.tags?.name?.toLowerCase() === tag.toLowerCase())
    );
  }

  res.json({ recipes, total: count, page: Number(page), limit: Number(limit) });
});

// GET /api/recipes/:slug — Get single recipe
router.get('/:slug', optionalAuth, async (req, res) => {
  const { data: recipe, error } = await supabaseAdmin
    .from('recipes')
    .select(`
      *,
      users (id, display_name, avatar_url, bio),
      ingredients (id, name, quantity, unit, photo_url, sort_order),
      steps (id, step_number, description, photo_url),
      recipe_tags (tags (id, name))
    `)
    .eq('slug', req.params.slug)
    .single();

  if (error || !recipe) return res.status(404).json({ error: 'Recipe not found' });

  // Private recipe — only owner can view
  if (!recipe.is_public && recipe.user_id !== req.user?.id) {
    return res.status(403).json({ error: 'This recipe is private' });
  }

  // Sort ingredients and steps
  recipe.ingredients.sort((a, b) => a.sort_order - b.sort_order);
  recipe.steps.sort((a, b) => a.step_number - b.step_number);

  res.json({ recipe });
});

// POST /api/recipes — Create recipe
router.post('/',
  requireAuth,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('base_servings').isInt({ min: 1 }).withMessage('Base servings must be a positive integer'),
    body('is_public').isBoolean(),
    body('ingredients').isArray({ min: 1 }).withMessage('At least one ingredient is required'),
    body('steps').isArray({ min: 1 }).withMessage('At least one step is required'),
  ],
  validate,
  async (req, res) => {
    // Check free tier limit
    const { count } = await supabaseAdmin
      .from('recipes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.user.id);

    const { data: userRow } = await supabaseAdmin
      .from('users')
      .select('is_premium')
      .eq('id', req.user.id)
      .single();

    if (!userRow?.is_premium && count >= 5) {
      return res.status(403).json({ error: 'Free tier limit reached. Upgrade to premium.' });
    }

    const { title, description, cover_photo_url, cuisine, difficulty, cooking_time_minutes,
            base_servings, is_public, ingredients, steps, tags } = req.body;

    const slug = slugify(title);

    // Insert recipe
    const { data: recipe, error: recipeError } = await supabaseAdmin
      .from('recipes')
      .insert({
        user_id: req.user.id, title, slug, description, cover_photo_url, cuisine,
        difficulty, cooking_time_minutes, base_servings, is_public
      })
      .select()
      .single();

    if (recipeError) return res.status(500).json({ error: recipeError.message });

    // Insert ingredients
    if (ingredients?.length) {
      const ingredientRows = ingredients.map((ing, i) => ({
        recipe_id: recipe.id, name: ing.name, quantity: ing.quantity,
        unit: ing.unit, photo_url: ing.photo_url || null, sort_order: i
      }));
      await supabaseAdmin.from('ingredients').insert(ingredientRows);
    }

    // Insert steps
    if (steps?.length) {
      const stepRows = steps.map((step, i) => ({
        recipe_id: recipe.id, step_number: i + 1,
        description: step.description, photo_url: step.photo_url || null
      }));
      await supabaseAdmin.from('steps').insert(stepRows);
    }

    // Insert tags
    if (tags?.length) {
      const tagRows = tags.map(tagId => ({ recipe_id: recipe.id, tag_id: tagId }));
      await supabaseAdmin.from('recipe_tags').insert(tagRows);
    }

    res.status(201).json({ recipe });
  }
);

// PUT /api/recipes/:id — Update recipe (owner only)
router.put('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;

  // Verify ownership
  const { data: existing } = await supabaseAdmin
    .from('recipes').select('user_id').eq('id', id).single();
  if (!existing) return res.status(404).json({ error: 'Recipe not found' });
  if (existing.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

  const { title, description, cover_photo_url, cuisine, difficulty, cooking_time_minutes,
          base_servings, is_public, ingredients, steps, tags } = req.body;

  const updates = { title, description, cover_photo_url, cuisine, difficulty,
                    cooking_time_minutes, base_servings, is_public };
  if (title) updates.slug = slugify(title);

  const { data: recipe, error } = await supabaseAdmin
    .from('recipes').update(updates).eq('id', id).select().single();
  if (error) return res.status(500).json({ error: error.message });

  // Replace ingredients and steps
  if (ingredients) {
    await supabaseAdmin.from('ingredients').delete().eq('recipe_id', id);
    const ingredientRows = ingredients.map((ing, i) => ({
      recipe_id: id, name: ing.name, quantity: ing.quantity,
      unit: ing.unit, photo_url: ing.photo_url || null, sort_order: i
    }));
    await supabaseAdmin.from('ingredients').insert(ingredientRows);
  }

  if (steps) {
    await supabaseAdmin.from('steps').delete().eq('recipe_id', id);
    const stepRows = steps.map((step, i) => ({
      recipe_id: id, step_number: i + 1,
      description: step.description, photo_url: step.photo_url || null
    }));
    await supabaseAdmin.from('steps').insert(stepRows);
  }

  if (tags) {
    await supabaseAdmin.from('recipe_tags').delete().eq('recipe_id', id);
    if (tags.length) {
      const tagRows = tags.map(tagId => ({ recipe_id: id, tag_id: tagId }));
      await supabaseAdmin.from('recipe_tags').insert(tagRows);
    }
  }

  res.json({ recipe });
});

// DELETE /api/recipes/:id — Delete recipe (owner only)
router.delete('/:id', requireAuth, async (req, res) => {
  const { data: existing } = await supabaseAdmin
    .from('recipes').select('user_id').eq('id', req.params.id).single();
  if (!existing) return res.status(404).json({ error: 'Recipe not found' });
  if (existing.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

  await supabaseAdmin.from('recipes').delete().eq('id', req.params.id);
  res.json({ success: true });
});

// GET /api/recipes/:id/export/pdf — Generate and return PDF
router.get('/:id/export/pdf', async (req, res) => {
  const { data: recipe, error } = await supabaseAdmin
    .from('recipes')
    .select(`
      *,
      users (display_name),
      ingredients (name, quantity, unit, sort_order),
      steps (step_number, description, photo_url),
      recipe_tags (tags (name))
    `)
    .eq('id', req.params.id)
    .single();

  if (error || !recipe) return res.status(404).json({ error: 'Recipe not found' });

  const servings = req.query.servings ? Number(req.query.servings) : recipe.base_servings;
  const scaleFactor = servings / recipe.base_servings;

  recipe.ingredients.sort((a, b) => a.sort_order - b.sort_order);
  recipe.steps.sort((a, b) => a.step_number - b.step_number);

  const scaledIngredients = recipe.ingredients.map(ing => ({
    ...ing,
    quantity: Math.round(ing.quantity * scaleFactor * 100) / 100
  }));

  try {
    const pdfBuffer = await generateRecipePDF({ ...recipe, ingredients: scaledIngredients, servings });
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${recipe.slug}.pdf"`
    });
    res.send(pdfBuffer);
  } catch (err) {
    console.error('PDF generation error:', err);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

module.exports = router;

require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const recipesRoutes = require('./routes/recipes');
const usersRoutes = require('./routes/users');
const bookmarksRoutes = require('./routes/bookmarks');
const tagsRoutes = require('./routes/tags');
const stripeRoutes = require('./routes/stripe');

const app = express();
const PORT = process.env.SERVER_PORT || 3001;

// Stripe webhook needs raw body — mount before json parser
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

app.use(cors({ origin: process.env.APP_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/api/recipes', recipesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/bookmarks', bookmarksRoutes);
app.use('/api/tags', tagsRoutes);
app.use('/api/stripe', stripeRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`RecipeVault server running on http://localhost:${PORT}`);
});

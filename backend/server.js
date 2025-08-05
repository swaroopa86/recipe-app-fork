const fs = require('fs');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Ensure the db directory exists (for local development)
const dbPath = process.env.NODE_ENV === 'production' ? '/app/db' : './db';
fs.mkdirSync(dbPath, { recursive: true });

// Connect to SQLite database (or create it if it doesn't exist)
const db = new sqlite3.Database(`${dbPath}/recipe_app.db`, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    // Initialize tables
    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS recipes (
        id TEXT PRIMARY KEY,
        name TEXT,
        ingredients TEXT,
        method TEXT,
        cookingTime TEXT
      )`);
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        allergens TEXT
      )`);
      db.run(`CREATE TABLE IF NOT EXISTS pantryItems (
        id TEXT PRIMARY KEY,
        name TEXT,
        quantity TEXT,
        unit TEXT,
        price REAL
      )`);
      db.run(`CREATE TABLE IF NOT EXISTS shoppingList (
        id TEXT PRIMARY KEY,
        name TEXT,
        quantity TEXT,
        unit TEXT,
        purchased INTEGER DEFAULT 0,
        recipeSource TEXT
      )`);
      db.run(`CREATE TABLE IF NOT EXISTS pantryDetails (
        userId TEXT PRIMARY KEY,
        pantryName TEXT,
        pantryType TEXT,
        createdAt TEXT
      )`);
      console.log('Tables created or already exist.');
    });
  }
});

// Helper to run database queries as promises
const dbRun = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID });
      }
    });
  });
};

const dbAll = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

const dbGet = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

// API Endpoints for Recipes
app.get('/api/recipes', async (req, res) => {
  try {
    const recipes = await dbAll('SELECT * FROM recipes');
    res.json(recipes.map(r => {
      let cookingTime = null;
      if (r.cookingTime) {
        try {
          cookingTime = JSON.parse(r.cookingTime);
        } catch (e) {
          cookingTime = null;
        }
      }
      return {
        ...r,
        ingredients: JSON.parse(r.ingredients),
        cookingTime
      };
    }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/recipes', async (req, res) => {
  const { id, name, ingredients, method, cookingTime } = req.body;
  try {
    await dbRun(
      'INSERT INTO recipes (id, name, ingredients, method, cookingTime) VALUES (?, ?, ?, ?, ?)',
      [id, name, JSON.stringify(ingredients), method, JSON.stringify(cookingTime)]
    );
    res.status(201).json({ id, name, ingredients, method, cookingTime });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/recipes/:id', async (req, res) => {
  const { id } = req.params;
  const { name, ingredients, method, cookingTime } = req.body;
  try {
    await dbRun(
      'UPDATE recipes SET name = ?, ingredients = ?, method = ?, cookingTime = ? WHERE id = ?',
      [name, JSON.stringify(ingredients), method, JSON.stringify(cookingTime), id]
    );
    res.json({ id, name, ingredients, method, cookingTime });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/recipes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await dbRun('DELETE FROM recipes WHERE id = ?', id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API Endpoints for Users
app.get('/api/users', async (req, res) => {
  try {
    const users = await dbAll('SELECT * FROM users');
    res.json(users.map(u => ({
      ...u,
      allergens: JSON.parse(u.allergens)
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  const { id, name, allergens } = req.body;
  try {
    await dbRun(
      'INSERT INTO users (id, name, allergens) VALUES (?, ?, ?)',
      [id, name, JSON.stringify(allergens)]
    );
    res.status(201).json({ id, name, allergens });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, allergens } = req.body;
  try {
    await dbRun(
      'UPDATE users SET name = ?, allergens = ? WHERE id = ?',
      [name, JSON.stringify(allergens), id]
    );
    res.json({ id, name, allergens });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await dbRun('DELETE FROM users WHERE id = ?', id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API Endpoints for Pantry Items
app.get('/api/pantryItems', async (req, res) => {
  try {
    const pantryItems = await dbAll('SELECT * FROM pantryItems');
    res.json(pantryItems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/pantryItems', async (req, res) => {
  const { id, name, quantity, unit, price = null } = req.body;
  try {
    await dbRun(
      'INSERT INTO pantryItems (id, name, quantity, unit, price) VALUES (?, ?, ?, ?, ?)',
      [id, name, quantity, unit, price]
    );
    res.status(201).json({ id, name, quantity, unit, price });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/pantryItems/:id', async (req, res) => {
  const { id } = req.params;
  const { name, quantity, unit, price = null } = req.body;
  try {
    await dbRun(
      'UPDATE pantryItems SET name = ?, quantity = ?, unit = ?, price = ? WHERE id = ?',
      [name, quantity, unit, price, id]
    );
    res.json({ id, name, quantity, unit, price });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/pantryItems/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await dbRun('DELETE FROM pantryItems WHERE id = ?', id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API Endpoints for Shopping List
app.get('/api/shoppingList', async (req, res) => {
  try {
    const items = await dbAll('SELECT * FROM shoppingList');
    // Convert purchased from 0/1 to boolean for frontend
    res.json(items.map(item => ({
      ...item,
      purchased: !!item.purchased
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/shoppingList', async (req, res) => {
  const { id, name, quantity, unit, purchased = 0, recipeSource = '' } = req.body;
  try {
    await dbRun(
      'INSERT INTO shoppingList (id, name, quantity, unit, purchased, recipeSource) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, quantity, unit, purchased ? 1 : 0, recipeSource]
    );
    res.status(201).json({ id, name, quantity, unit, purchased, recipeSource });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/shoppingList/:id', async (req, res) => {
  const { id } = req.params;
  const { name, quantity, unit, purchased = 0, recipeSource = '' } = req.body;
  try {
    await dbRun(
      'UPDATE shoppingList SET name = ?, quantity = ?, unit = ?, purchased = ?, recipeSource = ? WHERE id = ?',
      [name, quantity, unit, purchased ? 1 : 0, recipeSource, id]
    );
    res.json({ id, name, quantity, unit, purchased, recipeSource });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/shoppingList/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await dbRun('DELETE FROM shoppingList WHERE id = ?', id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API Endpoints for Pantry Details
app.get('/api/pantryDetails/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const pantryDetails = await dbGet('SELECT * FROM pantryDetails WHERE userId = ?', [userId]);
    res.json(pantryDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/pantryDetails', async (req, res) => {
  const { userId, pantryName, pantryType } = req.body;
  try {
    await dbRun(
      'INSERT INTO pantryDetails (userId, pantryName, pantryType, createdAt) VALUES (?, ?, ?, ?)',
      [userId, pantryName, pantryType, new Date().toISOString()]
    );
    res.status(201).json({ userId, pantryName, pantryType });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/pantryDetails/:userId', async (req, res) => {
  const { userId } = req.params;
  const { pantryName, pantryType } = req.body;
  try {
    await dbRun(
      'UPDATE pantryDetails SET pantryName = ?, pantryType = ? WHERE userId = ?',
      [pantryName, pantryType, userId]
    );
    res.json({ userId, pantryName, pantryType });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

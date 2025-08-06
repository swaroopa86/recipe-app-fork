require('dotenv').config();
const fs = require('fs');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

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
        pantryId TEXT,
        name TEXT,
        ingredients TEXT,
        method TEXT,
        cookingTime TEXT,
        FOREIGN KEY (pantryId) REFERENCES pantryDetails (pantryId)
      )`);
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        pantryId TEXT,
        name TEXT,
        allergens TEXT,
        FOREIGN KEY (pantryId) REFERENCES pantryDetails (pantryId)
      )`);
      db.run(`CREATE TABLE IF NOT EXISTS pantryItems (
        id TEXT PRIMARY KEY,
        pantryId TEXT,
        name TEXT,
        quantity TEXT,
        unit TEXT,
        FOREIGN KEY (pantryId) REFERENCES pantryDetails (pantryId)
      )`);
      db.run(`CREATE TABLE IF NOT EXISTS price_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pantry_item_id TEXT,
        price REAL,
        quantity REAL,
        added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(pantry_item_id) REFERENCES pantryItems(id)
      )`);
      db.run(`CREATE TABLE IF NOT EXISTS shoppingList (
        id TEXT PRIMARY KEY,
        pantryId TEXT,
        name TEXT,
        quantity TEXT,
        unit TEXT,
        purchased INTEGER DEFAULT 0,
        recipeSource TEXT,
        FOREIGN KEY (pantryId) REFERENCES pantryDetails (pantryId)
      )`);
      // Create pantryDetails table without UNIQUE constraint on pantryId
      db.run(`CREATE TABLE IF NOT EXISTS pantryDetails (
        userId TEXT PRIMARY KEY,
        pantryId TEXT,
        pantryName TEXT,
        pantryType TEXT,
        createdAt TEXT
      )`);
      db.run(`CREATE TABLE IF NOT EXISTS invitations (
        id TEXT PRIMARY KEY,
        pantryId TEXT,
        pantryName TEXT,
        inviteeName TEXT,
        inviteeEmail TEXT,
        status TEXT DEFAULT 'pending',
        createdAt TEXT,
        FOREIGN KEY (pantryId) REFERENCES pantryDetails (pantryId)
      )`);
      db.run(`CREATE TABLE IF NOT EXISTS cookingHistory (
        id TEXT PRIMARY KEY,
        recipeId TEXT,
        recipeName TEXT,
        cookedAt TEXT,
        servings INTEGER DEFAULT 1,
        userId TEXT,
        FOREIGN KEY(recipeId) REFERENCES recipes(id)
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

// Email configuration
const createTransporter = () => {
  // Check if email credentials are configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('⚠️  Email credentials not configured. Using test mode - emails will be logged to console only.');
    return null;
  }
  
  // For development, use Gmail with app password
  // In production, you would use a proper email service like SendGrid, AWS SES, etc.
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Email sending function
const sendInvitationEmail = async (inviteeName, inviteeEmail, pantryName, pantryId) => {
  try {
    const transporter = createTransporter();
    
    // If no email credentials configured, just log the email content
    if (!transporter) {
      const emailContent = `
🥫 Smart Pantry Invitation

Hello ${inviteeName}!

You've been invited to join ${pantryName} on Smart Pantry - the intelligent way to manage your kitchen inventory and meal planning!

What you can do with Smart Pantry:
📝 Track pantry items and expiration dates
🛒 Create and share shopping lists
🍳 Discover recipes based on available ingredients
👥 Collaborate with family or team members
🔥 Set and track caloric goals
📊 Monitor your nutrition and health goals

Join ${pantryName}: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/join-pantry/${pantryId}

This invitation was sent from Smart Pantry. If you didn't expect this invitation, you can safely ignore this email.
      `;
      
      console.log(`📧 EMAIL WOULD BE SENT TO: ${inviteeEmail}`);
      console.log(`📧 EMAIL CONTENT:`);
      console.log(emailContent);
      console.log(`📧 EMAIL END`);
      
      return { messageId: 'test-mode', status: 'logged' };
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: inviteeEmail,
      subject: `You're invited to join ${pantryName} on Smart Pantry!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🥫 Smart Pantry Invitation</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${inviteeName}!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              You've been invited to join <strong>${pantryName}</strong> on Smart Pantry - the intelligent way to manage your kitchen inventory and meal planning!
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="color: #333; margin-top: 0;">What you can do with Smart Pantry:</h3>
              <ul style="color: #666; line-height: 1.8;">
                <li>📝 Track pantry items and expiration dates</li>
                <li>🛒 Create and share shopping lists</li>
                <li>🍳 Discover recipes based on available ingredients</li>
                <li>👥 Collaborate with family or team members</li>
                <li>🔥 Set and track caloric goals</li>
                <li>📊 Monitor your nutrition and health goals</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/join-pantry/${pantryId}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                🚀 Join ${pantryName}
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
              This invitation was sent from Smart Pantry. If you didn't expect this invitation, you can safely ignore this email.
            </p>
          </div>
        </div>
      `
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${inviteeEmail}:`, result.messageId);
    return result;
  } catch (error) {
    console.error(`❌ Failed to send email to ${inviteeEmail}:`, error);
    throw error;
  }
};

// Function to generate unique pantry ID
const generatePantryId = () => {
  // Generate a random 8-character alphanumeric string
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};

// Function to check if pantry ID already exists
const isPantryIdUnique = async (pantryId) => {
  try {
    const existing = await dbGet('SELECT pantryId FROM pantryDetails WHERE pantryId = ?', [pantryId]);
    return !existing;
  } catch (err) {
    console.error('Error checking pantry ID uniqueness:', err);
    return false;
  }
};

// Function to generate a unique pantry ID
const generateUniquePantryId = async () => {
  let pantryId;
  let attempts = 0;
  const maxAttempts = 10;
  
  do {
    pantryId = generatePantryId();
    attempts++;
    if (attempts > maxAttempts) {
      throw new Error('Unable to generate unique pantry ID after maximum attempts');
    }
  } while (!(await isPantryIdUnique(pantryId)));
  
  return pantryId;
};

// API Endpoints for Recipes
app.get('/api/recipes/:pantryId', async (req, res) => {
  const { pantryId } = req.params;
  try {
    const recipes = await dbAll('SELECT * FROM recipes WHERE pantryId = ?', [pantryId]);
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
  const { id, pantryId, name, ingredients, method, cookingTime } = req.body;
  try {
    await dbRun(
      'INSERT INTO recipes (id, pantryId, name, ingredients, method, cookingTime) VALUES (?, ?, ?, ?, ?, ?)',
      [id, pantryId, name, JSON.stringify(ingredients), method, JSON.stringify(cookingTime)]
    );
    res.status(201).json({ id, pantryId, name, ingredients, method, cookingTime });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/recipes/:id', async (req, res) => {
  const { id } = req.params;
  const { pantryId, name, ingredients, method, cookingTime } = req.body;
  try {
    await dbRun(
      'UPDATE recipes SET pantryId = ?, name = ?, ingredients = ?, method = ?, cookingTime = ? WHERE id = ?',
      [pantryId, name, JSON.stringify(ingredients), method, JSON.stringify(cookingTime), id]
    );
    res.json({ id, pantryId, name, ingredients, method, cookingTime });
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
app.get('/api/users/:pantryId', async (req, res) => {
  const { pantryId } = req.params;
  try {
    const users = await dbAll('SELECT * FROM users WHERE pantryId = ?', [pantryId]);
    res.json(users.map(u => ({
      ...u,
      allergens: JSON.parse(u.allergens)
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  const { id, pantryId, name, allergens } = req.body;
  try {
    await dbRun(
      'INSERT INTO users (id, pantryId, name, allergens) VALUES (?, ?, ?, ?)',
      [id, pantryId, name, JSON.stringify(allergens)]
    );
    res.status(201).json({ id, pantryId, name, allergens });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { pantryId, name, allergens } = req.body;
  try {
    await dbRun(
      'UPDATE users SET pantryId = ?, name = ?, allergens = ? WHERE id = ?',
      [pantryId, name, JSON.stringify(allergens), id]
    );
    res.json({ id, pantryId, name, allergens });
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
app.get('/api/pantryItems/:pantryId', async (req, res) => {
  const { pantryId } = req.params;
  try {
    const pantryItems = await dbAll('SELECT * FROM pantryItems WHERE pantryId = ?', [pantryId]);
    res.json(pantryItems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/pantryItems', async (req, res) => {
  const { id, pantryId, name, quantity, unit, price = null } = req.body;
  try {
    // Check for existing item by pantryId and normalized name
    const normalizedName = name.trim().toLowerCase();
    const existing = await dbGet(
      'SELECT * FROM pantryItems WHERE pantryId = ? AND LOWER(TRIM(name)) = ?',
      [pantryId, normalizedName]
    );
    let finalId = id;
    if (existing) {
      // Merge: add quantities and update price
      const newQuantity = (parseFloat(existing.quantity) || 0) + (parseFloat(quantity) || 0);
      await dbRun(
        'UPDATE pantryItems SET quantity = ?, unit = ? WHERE id = ?',
        [newQuantity.toString(), unit, existing.id]
      );
      finalId = existing.id;
    } else {
      // Insert new
      await dbRun(
        'INSERT INTO pantryItems (id, pantryId, name, quantity, unit) VALUES (?, ?, ?, ?, ?)',
        [id, pantryId, name, quantity, unit]
      );
    }
    // Insert into price_history
    await dbRun(
      'INSERT INTO price_history (pantry_item_id, price, quantity) VALUES (?, ?, ?)',
      [finalId, price, quantity]
    );
    res.status(201).json({ id: finalId, pantryId, name, quantity, unit });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/pantryItems/:id', async (req, res) => {
  const { id } = req.params;
  const { pantryId, name, quantity, unit, price = null } = req.body;
  try {
    await dbRun(
      'UPDATE pantryItems SET pantryId = ?, name = ?, quantity = ?, unit = ? WHERE id = ?',
      [pantryId, name, quantity, unit, id]
    );
    // Insert into price_history
    await dbRun(
      'INSERT INTO price_history (pantry_item_id, price, quantity) VALUES (?, ?, ?)',
      [id, price, quantity]
    );
    res.json({ id, pantryId, name, quantity, unit });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API endpoint to log price history directly
app.post('/api/price_history', async (req, res) => {
  const { pantry_item_id, price, quantity } = req.body;
  try {
    await dbRun(
      'INSERT INTO price_history (pantry_item_id, price, quantity) VALUES (?, ?, ?)',
      [pantry_item_id, price, quantity]
    );
    res.status(201).json({ pantry_item_id, price, quantity });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET endpoint to aggregate price history for the past week
app.get('/api/price_history/weekly', async (req, res) => {
  try {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    // Get all price history records from the last 7 days
    const rows = await dbAll(
      `SELECT ph.*, pi.name as itemName
       FROM price_history ph
       LEFT JOIN pantryItems pi ON ph.pantry_item_id = pi.id
       WHERE ph.added_at >= ?`,
      [weekAgo]
    );
    // Calculate total spent and per-item/recipe aggregates
    let totalSpent = 0;
    const itemSpend = {};
    rows.forEach(row => {
      if (row.price != null && row.price !== '') {
        const spent = (row.price || 0) * (row.quantity || 1);
        totalSpent += spent;
        if (!itemSpend[row.pantry_item_id]) {
        itemSpend[row.pantry_item_id] = {
          name: row.itemName || row.pantry_item_id,
          totalSpent: 0,
          totalQuantity: 0,
          lastPrice: row.price
        };
      }
        itemSpend[row.pantry_item_id].totalSpent += spent;
        itemSpend[row.pantry_item_id].totalQuantity += row.quantity || 0;
        itemSpend[row.pantry_item_id].lastPrice = row.price;
      }
    });
    res.json({
      period: {
        start: weekAgo,
        end: new Date().toISOString()
      },
      totalSpent,
      itemSpend: Object.values(itemSpend),
      raw: rows
    });
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
app.get('/api/shoppingList/:pantryId', async (req, res) => {
  const { pantryId } = req.params;
  try {
    const items = await dbAll('SELECT * FROM shoppingList WHERE pantryId = ?', [pantryId]);
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
  const { id, pantryId, name, quantity, unit, purchased = 0, recipeSource = '' } = req.body;
  try {
    await dbRun(
      'INSERT INTO shoppingList (id, pantryId, name, quantity, unit, purchased, recipeSource) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, pantryId, name, quantity, unit, purchased ? 1 : 0, recipeSource]
    );
    res.status(201).json({ id, pantryId, name, quantity, unit, purchased, recipeSource });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/shoppingList/:id', async (req, res) => {
  const { id } = req.params;
  const { pantryId, name, quantity, unit, purchased = 0, recipeSource = '' } = req.body;
  try {
    await dbRun(
      'UPDATE shoppingList SET pantryId = ?, name = ?, quantity = ?, unit = ?, purchased = ?, recipeSource = ? WHERE id = ?',
      [pantryId, name, quantity, unit, purchased ? 1 : 0, recipeSource, id]
    );
    res.json({ id, pantryId, name, quantity, unit, purchased, recipeSource });
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

app.post('/api/cookingHistory', async (req, res) => {
  const { id, recipeId, recipeName, cookedAt, servings, userId } = req.body;
  try {
    await dbRun(
      'INSERT INTO cookingHistory (id, recipeId, recipeName, cookedAt, servings, userId) VALUES (?, ?, ?, ?, ?, ?)',
      [id, recipeId, recipeName, cookedAt, servings || 1, userId]
    );
    res.status(201).json({ id, recipeId, recipeName, cookedAt, servings, userId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/generatePantryId', async (req, res) => {
  try {
    const pantryId = await generateUniquePantryId();
    res.json({ pantryId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/pantryDetails', async (req, res) => {
  const { userId, pantryId, pantryName, pantryType } = req.body;
  try {
    await dbRun(
      'INSERT INTO pantryDetails (userId, pantryId, pantryName, pantryType, createdAt) VALUES (?, ?, ?, ?, ?)',
      [userId, pantryId, pantryName, pantryType, new Date().toISOString()]
    );
    res.status(201).json({ userId, pantryId, pantryName, pantryType });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/pantryDetails/:userId', async (req, res) => {
  const { userId } = req.params;
  const { pantryId, pantryName, pantryType } = req.body;
  try {
    await dbRun(
      'UPDATE pantryDetails SET pantryId = ?, pantryName = ?, pantryType = ? WHERE userId = ?',
      [pantryId, pantryName, pantryType, userId]
    );
    res.json({ userId, pantryId, pantryName, pantryType });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API Endpoints for Invitations
app.get('/api/invitations/pending/:email', async (req, res) => {
  const { email } = req.params;
  try {
    const pendingInvitation = await dbGet(
      'SELECT * FROM invitations WHERE inviteeEmail = ? AND status = ?',
      [email, 'pending']
    );
    
    if (pendingInvitation) {
      // Get pantry details for this invitation
      const pantryDetails = await dbGet(
        'SELECT * FROM pantryDetails WHERE pantryId = ?',
        [pendingInvitation.pantryId]
      );
      
      res.json({
        invitation: pendingInvitation,
        pantryDetails: pantryDetails
      });
    } else {
      res.json(null);
    }
  } catch (err) {
    console.error('Error fetching pending invitation:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/invitations', async (req, res) => {
  const { pantryId, pantryName, invitations } = req.body;
  try {
    const invitationIds = [];
    const emailResults = [];
    
    for (const invitation of invitations) {
      const invitationId = crypto.randomBytes(8).toString('hex');
      
      // Save invitation to database
      await dbRun(
        'INSERT INTO invitations (id, pantryId, pantryName, inviteeName, inviteeEmail, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [invitationId, pantryId, pantryName, invitation.name, invitation.email, 'pending', new Date().toISOString()]
      );
      invitationIds.push(invitationId);
      
      // Send email invitation
      try {
        await sendInvitationEmail(invitation.name, invitation.email, pantryName, pantryId);
        emailResults.push({ email: invitation.email, status: 'sent' });
      } catch (emailError) {
        console.error(`Failed to send email to ${invitation.email}:`, emailError);
        emailResults.push({ email: invitation.email, status: 'failed', error: emailError.message });
      }
    }
    
    const successfulEmails = emailResults.filter(result => result.status === 'sent').length;
    const failedEmails = emailResults.filter(result => result.status === 'failed');
    
    console.log(`Invitations processed for pantry ${pantryName}:`, {
      total: invitations.length,
      successful: successfulEmails,
      failed: failedEmails.length,
      results: emailResults
    });
    
    res.status(201).json({ 
      message: `Successfully sent ${successfulEmails} invitation(s)`,
      invitationIds,
      emailResults,
      successfulEmails,
      failedEmails: failedEmails.length
    });
  } catch (err) {
    console.error('Error processing invitations:', err);
    res.status(500).json({ error: err.message });
  }
});

// API Endpoint for Weekly Report
app.get('/api/reports/weekly', async (req, res) => {
  try {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    
    // Get cooking history from last 7 days
    const cookedRecipes = await dbAll(
      'SELECT * FROM cookingHistory WHERE cookedAt >= ? ORDER BY cookedAt DESC',
      [weekAgo]
    );
    
    // Get current pantry items
    const pantryItems = await dbAll('SELECT * FROM pantryItems');
    
    // Get all recipes for reference
    const recipes = await dbAll('SELECT * FROM recipes');
    
    res.json({
      period: {
        start: weekAgo,
        end: new Date().toISOString()
      },
      cookedRecipes,
      pantryItems,
      recipes: recipes.map(recipe => ({
        ...recipe,
        ingredients: JSON.parse(recipe.ingredients)
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/invitations/accept', async (req, res) => {
  const { invitationId, userId, userEmail, userName } = req.body;
  try {
    // Get the invitation details
    const invitation = await dbGet(
      'SELECT * FROM invitations WHERE id = ? AND status = ?',
      [invitationId, 'pending']
    );
    
    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found or already processed' });
    }
    
    // Get pantry details
    const pantryDetails = await dbGet(
      'SELECT * FROM pantryDetails WHERE pantryId = ?',
      [invitation.pantryId]
    );
    
    if (!pantryDetails) {
      return res.status(404).json({ error: 'Pantry not found' });
    }
    
    // Check if user already has pantry details
    const existingUserPantry = await dbGet(
      'SELECT * FROM pantryDetails WHERE userId = ?',
      [userId]
    );
    
    if (existingUserPantry) {
      // Update existing user's pantry details to join the invited pantry
      await dbRun(
        'UPDATE pantryDetails SET pantryId = ?, pantryName = ?, pantryType = ? WHERE userId = ?',
        [invitation.pantryId, pantryDetails.pantryName, pantryDetails.pantryType, userId]
      );
    } else {
      // Add user to pantry details
      await dbRun(
        'INSERT INTO pantryDetails (userId, pantryId, pantryName, pantryType, createdAt) VALUES (?, ?, ?, ?, ?)',
        [userId, invitation.pantryId, pantryDetails.pantryName, pantryDetails.pantryType, new Date().toISOString()]
      );
    }
    
    // Mark invitation as accepted
    await dbRun(
      'UPDATE invitations SET status = ? WHERE id = ?',
      ['accepted', invitationId]
    );
    
    res.json({
      message: 'Invitation accepted successfully',
      pantryDetails: {
        userId,
        pantryId: invitation.pantryId,
        pantryName: pantryDetails.pantryName,
        pantryType: pantryDetails.pantryType
      }
    });
  } catch (err) {
    console.error('Error accepting invitation:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/invitations/decline', async (req, res) => {
  const { invitationId } = req.body;
  try {
    // Mark invitation as declined
    await dbRun(
      'UPDATE invitations SET status = ? WHERE id = ?',
      ['declined', invitationId]
    );
    
    res.json({ message: 'Invitation declined successfully' });
  } catch (err) {
    console.error('Error declining invitation:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

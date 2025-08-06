// Pre-built recipe database for automatic suggestions
export const RECIPE_DATABASE = [
  {
    id: 'pancakes-001',
    name: 'Classic Pancakes',
    cookingTime: '20 minutes',
    difficulty: 'Easy',
    servings: 4,
    category: 'Breakfast',
    ingredients: [
      { name: 'flour', quantity: '2', unit: 'cups', alternatives: ['all-purpose flour', 'wheat flour', 'plain flour', 'white flour'] },
      { name: 'milk', quantity: '1.5', unit: 'cups', alternatives: ['whole milk', 'dairy milk', 'fresh milk', '2% milk', 'skim milk'] },
      { name: 'eggs', quantity: '2', unit: 'pieces', alternatives: ['chicken eggs', 'fresh eggs', 'large eggs'] },
      { name: 'sugar', quantity: '2', unit: 'tablespoons', alternatives: ['white sugar', 'granulated sugar', 'caster sugar'] },
      { name: 'baking powder', quantity: '2', unit: 'teaspoons', alternatives: ['baking soda'] },
      { name: 'salt', quantity: '1', unit: 'teaspoon', alternatives: ['table salt', 'sea salt'] },
      { name: 'butter', quantity: '2', unit: 'tablespoons', alternatives: ['melted butter', 'salted butter', 'unsalted butter'] }
    ],
    method: 'Mix dry ingredients in a bowl. In another bowl, whisk milk, eggs, and melted butter. Combine wet and dry ingredients until just mixed. Cook on griddle over medium heat until bubbles form, then flip.'
  },
  {
    id: 'scrambled-eggs-001',
    name: 'Scrambled Eggs',
    cookingTime: '5 minutes',
    difficulty: 'Easy',
    servings: 2,
    category: 'Breakfast',
    ingredients: [
      { name: 'eggs', quantity: '4', unit: 'pieces', alternatives: ['chicken eggs', 'fresh eggs', 'large eggs'] },
      { name: 'milk', quantity: '2', unit: 'tablespoons', alternatives: ['cream', 'dairy milk', 'whole milk', 'heavy cream'] },
      { name: 'butter', quantity: '1', unit: 'tablespoon', alternatives: ['salted butter', 'unsalted butter'] },
      { name: 'salt', quantity: '1', unit: 'pinch', alternatives: ['table salt', 'sea salt'] },
      { name: 'pepper', quantity: '1', unit: 'pinch', alternatives: ['black pepper', 'ground pepper'] }
    ],
    method: 'Beat eggs with milk, salt, and pepper. Heat butter in pan over low heat. Add eggs and gently stir constantly until creamy and set.'
  },
  {
    id: 'pasta-marinara-001',
    name: 'Pasta Marinara',
    cookingTime: '25 minutes',
    difficulty: 'Easy',
    servings: 4,
    category: 'Dinner',
    ingredients: [
      { name: 'pasta', quantity: '1', unit: 'pound', alternatives: ['spaghetti', 'penne', 'linguine', 'noodles', 'macaroni'] },
      { name: 'tomatoes', quantity: '1', unit: 'can', alternatives: ['canned tomatoes', 'tomato sauce', 'crushed tomatoes', 'diced tomatoes', 'tomato paste'] },
      { name: 'garlic', quantity: '3', unit: 'cloves', alternatives: ['garlic powder', 'minced garlic', 'fresh garlic'] },
      { name: 'onion', quantity: '1', unit: 'medium', alternatives: ['yellow onion', 'white onion', 'red onion', 'onions'] },
      { name: 'olive oil', quantity: '2', unit: 'tablespoons', alternatives: ['oil', 'cooking oil', 'vegetable oil'] },
      { name: 'salt', quantity: '1', unit: 'teaspoon', alternatives: ['table salt', 'sea salt'] },
      { name: 'basil', quantity: '1', unit: 'teaspoon', alternatives: ['dried basil', 'fresh basil', 'herbs'] }
    ],
    method: 'Cook pasta according to package directions. Heat olive oil, sauté onion and garlic. Add tomatoes, salt, and basil. Simmer 15 minutes. Toss with cooked pasta.'
  },
  {
    id: 'french-toast-001',
    name: 'French Toast',
    cookingTime: '15 minutes',
    difficulty: 'Easy',
    servings: 4,
    category: 'Breakfast',
    ingredients: [
      { name: 'bread', quantity: '8', unit: 'slices', alternatives: ['white bread', 'brioche', 'challah'] },
      { name: 'eggs', quantity: '3', unit: 'pieces', alternatives: ['chicken eggs'] },
      { name: 'milk', quantity: '1/2', unit: 'cup', alternatives: ['whole milk', 'cream'] },
      { name: 'vanilla', quantity: '1', unit: 'teaspoon', alternatives: ['vanilla extract'] },
      { name: 'cinnamon', quantity: '1/2', unit: 'teaspoon', alternatives: ['ground cinnamon'] },
      { name: 'butter', quantity: '2', unit: 'tablespoons' }
    ],
    method: 'Whisk eggs, milk, vanilla, and cinnamon. Dip bread slices in mixture. Cook in buttered pan over medium heat until golden brown on both sides.'
  },
  {
    id: 'grilled-cheese-001',
    name: 'Grilled Cheese Sandwich',
    cookingTime: '10 minutes',
    difficulty: 'Easy',
    servings: 2,
    category: 'Lunch',
    ingredients: [
      { name: 'bread', quantity: '4', unit: 'slices', alternatives: ['white bread', 'sourdough', 'wheat bread', 'sandwich bread'] },
      { name: 'cheese', quantity: '4', unit: 'slices', alternatives: ['cheddar cheese', 'american cheese', 'swiss cheese', 'sliced cheese'] },
      { name: 'butter', quantity: '2', unit: 'tablespoons', alternatives: ['salted butter', 'unsalted butter'] }
    ],
    method: 'Butter one side of each bread slice. Place cheese between unbuttered sides. Cook in pan over medium heat until golden and cheese melts, flipping once.'
  },
  {
    id: 'rice-pilaf-001',
    name: 'Simple Rice Pilaf',
    cookingTime: '25 minutes',
    difficulty: 'Easy',
    servings: 4,
    category: 'Side Dish',
    ingredients: [
      { name: 'rice', quantity: '1', unit: 'cup', alternatives: ['white rice', 'long grain rice'] },
      { name: 'chicken broth', quantity: '2', unit: 'cups', alternatives: ['vegetable broth', 'stock'] },
      { name: 'onion', quantity: '1', unit: 'small', alternatives: ['yellow onion'] },
      { name: 'butter', quantity: '2', unit: 'tablespoons' },
      { name: 'salt', quantity: '1/2', unit: 'teaspoon' },
      { name: 'pepper', quantity: '1/4', unit: 'teaspoon', alternatives: ['black pepper'] }
    ],
    method: 'Sauté onion in butter until soft. Add rice and stir 2 minutes. Add broth, salt, and pepper. Bring to boil, reduce heat, cover and simmer 18 minutes.'
  },
  {
    id: 'chicken-soup-001',
    name: 'Basic Chicken Soup',
    cookingTime: '45 minutes',
    difficulty: 'Medium',
    servings: 6,
    category: 'Soup',
    ingredients: [
      { name: 'chicken', quantity: '1', unit: 'pound', alternatives: ['chicken breast', 'chicken thighs'] },
      { name: 'carrots', quantity: '2', unit: 'large', alternatives: ['baby carrots'] },
      { name: 'celery', quantity: '2', unit: 'stalks' },
      { name: 'onion', quantity: '1', unit: 'medium', alternatives: ['yellow onion'] },
      { name: 'chicken broth', quantity: '6', unit: 'cups', alternatives: ['stock'] },
      { name: 'noodles', quantity: '1', unit: 'cup', alternatives: ['egg noodles', 'pasta'] },
      { name: 'salt', quantity: '1', unit: 'teaspoon' },
      { name: 'pepper', quantity: '1/2', unit: 'teaspoon', alternatives: ['black pepper'] }
    ],
    method: 'Simmer chicken in broth 25 minutes. Remove chicken, shred when cool. Add vegetables to broth, cook 10 minutes. Add noodles, cook until tender. Return chicken to pot, season.'
  },
  {
    id: 'banana-smoothie-001',
    name: 'Banana Smoothie',
    cookingTime: '5 minutes',
    difficulty: 'Easy',
    servings: 2,
    category: 'Beverage',
    ingredients: [
      { name: 'bananas', quantity: '2', unit: 'large', alternatives: ['ripe bananas'] },
      { name: 'milk', quantity: '1', unit: 'cup', alternatives: ['dairy milk', 'almond milk'] },
      { name: 'yogurt', quantity: '1/2', unit: 'cup', alternatives: ['greek yogurt', 'vanilla yogurt'] },
      { name: 'honey', quantity: '1', unit: 'tablespoon', alternatives: ['maple syrup', 'sugar'] },
      { name: 'ice', quantity: '1/2', unit: 'cup' }
    ],
    method: 'Combine all ingredients in blender. Blend until smooth and creamy. Adjust sweetness to taste. Serve immediately.'
  },
  {
    id: 'tuna-salad-001',
    name: 'Tuna Salad',
    cookingTime: '10 minutes',
    difficulty: 'Easy',
    servings: 4,
    category: 'Lunch',
    ingredients: [
      { name: 'tuna', quantity: '2', unit: 'cans', alternatives: ['canned tuna'] },
      { name: 'mayonnaise', quantity: '1/3', unit: 'cup', alternatives: ['mayo'] },
      { name: 'celery', quantity: '2', unit: 'stalks' },
      { name: 'onion', quantity: '1/4', unit: 'cup', alternatives: ['red onion', 'green onion'] },
      { name: 'lemon juice', quantity: '1', unit: 'tablespoon' },
      { name: 'salt', quantity: '1/2', unit: 'teaspoon' },
      { name: 'pepper', quantity: '1/4', unit: 'teaspoon', alternatives: ['black pepper'] }
    ],
    method: 'Drain tuna and flake with fork. Mix with mayonnaise, diced celery, onion, lemon juice, salt, and pepper. Chill before serving.'
  },
  {
    id: 'caesar-salad-001',
    name: 'Caesar Salad',
    cookingTime: '15 minutes',
    difficulty: 'Easy',
    servings: 4,
    category: 'Salad',
    ingredients: [
      { name: 'lettuce', quantity: '1', unit: 'head', alternatives: ['romaine lettuce'] },
      { name: 'parmesan cheese', quantity: '1/2', unit: 'cup', alternatives: ['grated parmesan'] },
      { name: 'croutons', quantity: '1', unit: 'cup', alternatives: ['bread cubes'] },
      { name: 'caesar dressing', quantity: '1/4', unit: 'cup', alternatives: ['salad dressing'] },
      { name: 'lemon', quantity: '1', unit: 'whole', alternatives: ['lemon juice'] }
    ],
    method: 'Wash and chop lettuce. Toss with caesar dressing. Add croutons and parmesan cheese. Squeeze fresh lemon juice over top before serving.'
  },
  // More diverse recipes with different ingredients
  {
    id: 'avocado-toast-001',
    name: 'Simple Avocado Toast',
    cookingTime: '5 minutes',
    difficulty: 'Easy',
    servings: 2,
    category: 'Breakfast',
    ingredients: [
      { name: 'avocado', quantity: '1', unit: 'large', alternatives: ['avocados', 'ripe avocado'] },
      { name: 'bread', quantity: '2', unit: 'slices', alternatives: ['toast', 'sourdough', 'whole grain bread'] },
      { name: 'lemon', quantity: '1', unit: 'tablespoon', alternatives: ['lemon juice', 'lime', 'lime juice'] },
      { name: 'salt', quantity: '1', unit: 'pinch', alternatives: ['sea salt', 'table salt'] }
    ],
    method: 'Toast bread. Mash avocado with lemon juice and salt. Spread on toast and serve immediately.'
  },
  {
    id: 'garlic-stir-fry-001',
    name: 'Simple Garlic Vegetable Stir Fry',
    cookingTime: '15 minutes',
    difficulty: 'Easy',
    servings: 4,
    category: 'Dinner',
    ingredients: [
      { name: 'vegetables', quantity: '2', unit: 'cups', alternatives: ['mixed vegetables', 'carrots', 'broccoli', 'bell peppers', 'cabbage'] },
      { name: 'garlic', quantity: '3', unit: 'cloves', alternatives: ['minced garlic', 'garlic powder'] },
      { name: 'oil', quantity: '2', unit: 'tablespoons', alternatives: ['vegetable oil', 'olive oil', 'cooking oil'] },
      { name: 'soy sauce', quantity: '2', unit: 'tablespoons', alternatives: ['tamari', 'liquid aminos'] },
      { name: 'ginger', quantity: '1', unit: 'teaspoon', alternatives: ['fresh ginger', 'ground ginger'] }
    ],
    method: 'Heat oil in wok or large pan. Add garlic and ginger, stir for 30 seconds. Add vegetables and stir-fry 5-8 minutes. Add soy sauce and toss.'
  },
  {
    id: 'baked-potato-001',
    name: 'Simple Baked Potato',
    cookingTime: '45 minutes',
    difficulty: 'Easy',
    servings: 4,
    category: 'Side Dish',
    ingredients: [
      { name: 'potatoes', quantity: '4', unit: 'large', alternatives: ['russet potatoes', 'baking potatoes'] },
      { name: 'oil', quantity: '1', unit: 'tablespoon', alternatives: ['olive oil', 'vegetable oil'] },
      { name: 'salt', quantity: '1', unit: 'teaspoon', alternatives: ['sea salt', 'table salt'] }
    ],
    method: 'Preheat oven to 425°F. Scrub potatoes, poke holes with fork. Rub with oil and salt. Bake 45-60 minutes until tender.'
  },
  {
    id: 'fruit-salad-001',
    name: 'Fresh Fruit Salad',
    cookingTime: '10 minutes',
    difficulty: 'Easy',
    servings: 6,
    category: 'Dessert',
    ingredients: [
      { name: 'apples', quantity: '2', unit: 'medium', alternatives: ['apple', 'red apples', 'green apples'] },
      { name: 'bananas', quantity: '2', unit: 'medium', alternatives: ['banana', 'ripe bananas'] },
      { name: 'oranges', quantity: '2', unit: 'medium', alternatives: ['orange', 'fresh oranges'] },
      { name: 'grapes', quantity: '1', unit: 'cup', alternatives: ['fresh grapes', 'red grapes', 'green grapes'] },
      { name: 'honey', quantity: '2', unit: 'tablespoons', alternatives: ['maple syrup', 'sugar'] }
    ],
    method: 'Wash and chop all fruits into bite-sized pieces. Mix gently in large bowl. Drizzle with honey and toss lightly.'
  },
  {
    id: 'cucumber-salad-001',
    name: 'Simple Cucumber Salad',
    cookingTime: '10 minutes',
    difficulty: 'Easy',
    servings: 4,
    category: 'Salad',
    ingredients: [
      { name: 'cucumber', quantity: '2', unit: 'large', alternatives: ['cucumbers', 'fresh cucumber'] },
      { name: 'vinegar', quantity: '3', unit: 'tablespoons', alternatives: ['white vinegar', 'apple cider vinegar'] },
      { name: 'sugar', quantity: '1', unit: 'tablespoon', alternatives: ['honey', 'sweetener'] },
      { name: 'salt', quantity: '1', unit: 'teaspoon', alternatives: ['sea salt', 'table salt'] },
      { name: 'dill', quantity: '1', unit: 'tablespoon', alternatives: ['fresh dill', 'dried dill', 'herbs'] }
    ],
    method: 'Slice cucumbers thinly. Mix vinegar, sugar, and salt until dissolved. Pour over cucumbers, add dill, and chill 30 minutes.'
  },
  {
    id: 'roasted-vegetables-001',
    name: 'Simple Roasted Vegetables',
    cookingTime: '30 minutes',
    difficulty: 'Easy',
    servings: 4,
    category: 'Side Dish',
    ingredients: [
      { name: 'vegetables', quantity: '4', unit: 'cups', alternatives: ['mixed vegetables', 'carrots', 'zucchini', 'bell peppers', 'broccoli', 'cauliflower'] },
      { name: 'oil', quantity: '3', unit: 'tablespoons', alternatives: ['olive oil', 'vegetable oil'] },
      { name: 'salt', quantity: '1', unit: 'teaspoon', alternatives: ['sea salt', 'table salt'] },
      { name: 'pepper', quantity: '1/2', unit: 'teaspoon', alternatives: ['black pepper', 'ground pepper'] },
      { name: 'herbs', quantity: '1', unit: 'teaspoon', alternatives: ['dried herbs', 'oregano', 'thyme', 'rosemary'] }
    ],
    method: 'Preheat oven to 425°F. Cut vegetables into similar sizes. Toss with oil, salt, pepper, and herbs. Roast 25-30 minutes until tender.'
  },
  {
    id: 'bean-salad-001',
    name: 'Three Bean Salad',
    cookingTime: '15 minutes',
    difficulty: 'Easy',
    servings: 6,
    category: 'Salad',
    ingredients: [
      { name: 'black beans', quantity: '1', unit: 'can', alternatives: ['canned black beans', 'beans'] },
      { name: 'kidney beans', quantity: '1', unit: 'can', alternatives: ['red beans', 'canned kidney beans'] },
      { name: 'chickpeas', quantity: '1', unit: 'can', alternatives: ['garbanzo beans', 'canned chickpeas'] },
      { name: 'onion', quantity: '1/2', unit: 'medium', alternatives: ['red onion', 'white onion'] },
      { name: 'vinegar', quantity: '1/4', unit: 'cup', alternatives: ['apple cider vinegar', 'white vinegar'] },
      { name: 'oil', quantity: '2', unit: 'tablespoons', alternatives: ['olive oil', 'vegetable oil'] }
    ],
    method: 'Drain and rinse all beans. Dice onion finely. Mix vinegar and oil. Combine beans, onion, and dressing. Chill before serving.'
  },
  {
    id: 'quesadilla-001',
    name: 'Simple Cheese Quesadilla',
    cookingTime: '10 minutes',
    difficulty: 'Easy',
    servings: 2,
    category: 'Lunch',
    ingredients: [
      { name: 'tortillas', quantity: '2', unit: 'large', alternatives: ['flour tortillas', 'wraps'] },
      { name: 'cheese', quantity: '1', unit: 'cup', alternatives: ['shredded cheese', 'cheddar cheese', 'mexican cheese'] },
      { name: 'oil', quantity: '1', unit: 'tablespoon', alternatives: ['cooking spray', 'butter'] }
    ],
    method: 'Heat pan over medium heat. Place cheese on one tortilla, top with second tortilla. Cook 2-3 minutes per side until golden and cheese melts.'
  },
  {
    id: 'oatmeal-001',
    name: 'Basic Oatmeal',
    cookingTime: '10 minutes',
    difficulty: 'Easy',
    servings: 2,
    category: 'Breakfast',
    ingredients: [
      { name: 'oats', quantity: '1', unit: 'cup', alternatives: ['rolled oats', 'old-fashioned oats', 'oatmeal'] },
      { name: 'water', quantity: '2', unit: 'cups', alternatives: ['milk'] },
      { name: 'salt', quantity: '1', unit: 'pinch', alternatives: ['sea salt'] },
      { name: 'sugar', quantity: '1', unit: 'tablespoon', alternatives: ['honey', 'maple syrup', 'brown sugar'] }
    ],
    method: 'Bring water and salt to boil. Add oats, reduce heat, simmer 5-8 minutes stirring occasionally. Add sugar to taste.'
  },
  {
    id: 'hummus-001',
    name: 'Simple Hummus',
    cookingTime: '10 minutes',
    difficulty: 'Easy',
    servings: 4,
    category: 'Appetizer',
    ingredients: [
      { name: 'chickpeas', quantity: '1', unit: 'can', alternatives: ['garbanzo beans', 'canned chickpeas'] },
      { name: 'tahini', quantity: '2', unit: 'tablespoons', alternatives: ['sesame paste'] },
      { name: 'lemon', quantity: '2', unit: 'tablespoons', alternatives: ['lemon juice', 'lime juice'] },
      { name: 'garlic', quantity: '1', unit: 'clove', alternatives: ['minced garlic', 'garlic powder'] },
      { name: 'olive oil', quantity: '2', unit: 'tablespoons', alternatives: ['oil'] }
    ],
    method: 'Drain chickpeas, reserve liquid. Blend chickpeas, tahini, lemon juice, garlic, and olive oil. Add reserved liquid as needed for consistency.'
  }
];

// Helper function to find matching recipes based on pantry items
export const findMatchingRecipes = (pantryItems) => {
  console.log('🔍 Finding recipes for pantry items:', pantryItems?.map(item => item.name));
  
  if (!pantryItems || pantryItems.length === 0) {
    console.log('❌ No pantry items provided');
    return { canMakeNow: [], almostReady: [], needMoreIngredients: [] };
  }

  const canMakeNow = [];
  const almostReady = [];
  const needMoreIngredients = [];

  RECIPE_DATABASE.forEach(recipe => {
    const ingredientMatches = recipe.ingredients.map(ingredient => {
              // Check if any pantry item matches this recipe ingredient
        const pantryMatch = pantryItems.find(pantryItem => {
          const pantryName = pantryItem.name.toLowerCase().trim();
          const ingredientName = ingredient.name.toLowerCase().trim();
          
          console.log(`🔍 Checking pantry "${pantryName}" against recipe ingredient "${ingredientName}"`);
          
          // Direct match
          if (pantryName === ingredientName) {
            console.log(`✅ Direct match: "${pantryName}" === "${ingredientName}"`);
            return true;
          }
          
          // Check if pantry item contains ingredient name or vice versa
          if (pantryName.includes(ingredientName) || ingredientName.includes(pantryName)) {
            console.log(`✅ Partial match: "${pantryName}" <-> "${ingredientName}"`);
            return true;
          }
          
          // Special grocery receipt matching - common grocery item names
          const groceryMatches = {
            'milk': ['whole milk', 'skim milk', '2% milk', 'low fat milk', 'dairy milk'],
            'bread': ['white bread', 'wheat bread', 'whole grain bread', 'sandwich bread', 'loaf bread'],
            'cheese': ['cheddar cheese', 'american cheese', 'swiss cheese', 'mozzarella cheese', 'sliced cheese'],
            'butter': ['salted butter', 'unsalted butter', 'sweet butter'],
            'eggs': ['large eggs', 'medium eggs', 'free range eggs', 'organic eggs'],
            'flour': ['all purpose flour', 'wheat flour', 'white flour'],
            'sugar': ['white sugar', 'granulated sugar', 'cane sugar'],
            'oil': ['vegetable oil', 'canola oil', 'cooking oil'],
            'bananas': ['banana', 'fresh bananas', 'ripe bananas'],
            'apples': ['apple', 'red apples', 'green apples', 'fresh apples'],
            'oranges': ['orange', 'fresh oranges', 'navel oranges'],
            'potatoes': ['potato', 'russet potatoes', 'red potatoes', 'fresh potatoes'],
            'onion': ['yellow onion', 'white onion', 'red onion', 'sweet onion', 'onions'],
            'garlic': ['fresh garlic', 'garlic bulb'],
            'carrots': ['carrot', 'fresh carrots', 'baby carrots'],
            'tomatoes': ['tomato', 'fresh tomatoes', 'vine tomatoes'],
            'lettuce': ['iceberg lettuce', 'romaine lettuce', 'fresh lettuce'],
            'chicken': ['chicken breast', 'chicken thighs', 'fresh chicken', 'whole chicken'],
            'beef': ['ground beef', 'beef chuck', 'lean beef'],
            'pasta': ['spaghetti', 'penne pasta', 'macaroni', 'noodles'],
            'rice': ['white rice', 'brown rice', 'long grain rice']
          };
          
          // Check if pantry item matches any grocery-style names for this ingredient
          if (groceryMatches[ingredientName]) {
            const groceryMatch = groceryMatches[ingredientName].some(grocery => {
              const groceryName = grocery.toLowerCase().trim();
              if (pantryName === groceryName || 
                  pantryName.includes(groceryName) ||
                  groceryName.includes(pantryName)) {
                console.log(`✅ Grocery match: "${pantryName}" matches "${groceryName}" for ${ingredientName}`);
                return true;
              }
              return false;
            });
            if (groceryMatch) return true;
          }
          
          // Reverse check - see if any grocery items for pantry name match the ingredient
          for (const [recipeIngredient, groceryNames] of Object.entries(groceryMatches)) {
            if (groceryNames.some(grocery => grocery.toLowerCase().includes(pantryName) || pantryName.includes(grocery.toLowerCase()))) {
              if (recipeIngredient === ingredientName) {
                console.log(`✅ Reverse grocery match: pantry "${pantryName}" matches ingredient "${ingredientName}"`);
                return true;
              }
            }
          }
          
          // Check alternatives
          if (ingredient.alternatives) {
            const altMatch = ingredient.alternatives.some(alt => {
              const altName = alt.toLowerCase().trim();
              if (pantryName === altName || 
                  pantryName.includes(altName) ||
                  altName.includes(pantryName)) {
                console.log(`✅ Alternative match: "${pantryName}" matches "${altName}" for ${ingredientName}`);
                return true;
              }
              return false;
            });
            if (altMatch) return true;
          }
          
          console.log(`❌ No match found for "${pantryName}" vs "${ingredientName}"`);
          return false;
        });

      return {
        ingredient,
        hasInPantry: !!pantryMatch,
        pantryItem: pantryMatch
      };
    });

    const availableCount = ingredientMatches.filter(match => match.hasInPantry).length;
    const totalCount = ingredientMatches.length;
    const matchPercentage = (availableCount / totalCount) * 100;

    const recipeWithMatches = {
      ...recipe,
      ingredientMatches,
      availableCount,
      totalCount,
      matchPercentage
    };

    console.log(`📊 Recipe "${recipe.name}": ${availableCount}/${totalCount} ingredients (${Math.round(matchPercentage)}%)`);

    if (matchPercentage === 100) {
      canMakeNow.push(recipeWithMatches);
      console.log(`✅ Added "${recipe.name}" to canMakeNow`);
    } else if (matchPercentage >= 60) {
      almostReady.push(recipeWithMatches);
      console.log(`🛒 Added "${recipe.name}" to almostReady`);
    } else if (matchPercentage >= 30) {
      needMoreIngredients.push(recipeWithMatches);
      console.log(`💡 Added "${recipe.name}" to needMoreIngredients`);
    }
  });

  // Sort by match percentage
  almostReady.sort((a, b) => b.matchPercentage - a.matchPercentage);
  needMoreIngredients.sort((a, b) => b.matchPercentage - a.matchPercentage);

  const result = { 
    canMakeNow, 
    almostReady: almostReady.slice(0, 5), // Limit to top 5
    needMoreIngredients: needMoreIngredients.slice(0, 3) // Limit to top 3
  };

  console.log('🎯 Final results:', {
    canMakeNow: result.canMakeNow.length,
    almostReady: result.almostReady.length,
    needMoreIngredients: result.needMoreIngredients.length
  });

  return result;
};
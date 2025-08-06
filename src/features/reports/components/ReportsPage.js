import React, { useState, useEffect, useMemo } from 'react';
import { fetchWeeklyReport } from '../../../shared/api';
import { fetchWeeklyPriceHistory } from '../../../shared/api/priceHistory';
import { convertUnits, areUnitsCompatible } from '../../../utils/unitConversion';
import './ReportsPage.css';

const ReportsPage = ({ macrosByRecipe = {}, onNavigate }) => {
  const [reportData, setReportData] = useState(null);
  const [priceHistory, setPriceHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get saved calorie goal from localStorage
  const savedCalorieGoal = JSON.parse(localStorage.getItem('calorieGoal_result') || 'null');

  useEffect(() => {
    const loadReportData = async () => {
      try {
        setLoading(true);
        const [data, priceData] = await Promise.all([
          fetchWeeklyReport(),
          fetchWeeklyPriceHistory()
        ]);
        setReportData(data);
        setPriceHistory(priceData);
      } catch (err) {
        setError('Failed to load report data');
        // Error loading report data
      } finally {
        setLoading(false);
      }
    };

    loadReportData();
  }, []);

  const calculateImpactLevel = (usage, pantryItem) => {
    const usedQuantity = usage.totalUsed;
    const availableQuantity = parseFloat(pantryItem.quantity);
    
    // Try to convert units if different
    let convertedUsed = usedQuantity;
    if (usage.unit !== pantryItem.unit && areUnitsCompatible(usage.unit, pantryItem.unit)) {
      try {
        convertedUsed = convertUnits(usedQuantity, usage.unit, pantryItem.unit, usage.name);
      } catch (e) {
        // Conversion failed, use original
      }
    }
    
    const usageRatio = convertedUsed / availableQuantity;
    
    if (usageRatio >= 0.8) return 'high';
    if (usageRatio >= 0.5) return 'medium';
    if (usageRatio >= 0.2) return 'low';
    return 'minimal';
  };

  const analysisData = useMemo(() => {
    if (!reportData) return null;

    const { cookedRecipes, pantryItems, recipes } = reportData;

    // Calculate recipe frequency
    const recipeFrequency = cookedRecipes.reduce((acc, record) => {
      acc[record.recipeName] = (acc[record.recipeName] || 0) + 1;
      return acc;
    }, {});

    // Calculate total servings
    const totalServings = cookedRecipes.reduce((sum, record) => sum + (record.servings || 1), 0);

    // Calculate total calories consumed
    const totalCaloriesConsumed = cookedRecipes.reduce((sum, record) => {
      const recipe = recipes.find(r => r.id === record.recipeId);
      if (recipe && macrosByRecipe[record.recipeId]) {
        const macros = macrosByRecipe[record.recipeId];
        const caloriesPerServing = macros.calories || 0;
        const servings = record.servings || 1;
        return sum + (caloriesPerServing * servings);
      }
      return sum;
    }, 0);

    // Analyze ingredient usage
    const ingredientUsage = {};
    cookedRecipes.forEach(record => {
      const recipe = recipes.find(r => r.id === record.recipeId);
      if (recipe && recipe.ingredients) {
        recipe.ingredients.forEach(ingredient => {
          const name = ingredient.name.toLowerCase();
          const quantity = parseFloat(ingredient.quantity) || 0;
          const servings = record.servings || 1;
          
          if (!ingredientUsage[name]) {
            ingredientUsage[name] = {
              name: ingredient.name,
              totalUsed: 0,
              unit: ingredient.unit,
              timesUsed: 0
            };
          }
          
          ingredientUsage[name].totalUsed += quantity * servings;
          ingredientUsage[name].timesUsed += 1;
        });
      }
    });

    // Check pantry impact
    // DEBUG: Log priceHistory for inspection
    console.log('DEBUG priceHistory:', priceHistory);
    const pantryImpact = Object.values(ingredientUsage).map(usage => {
      const pantryItem = pantryItems.find(item => 
        item.name.toLowerCase().includes(usage.name.toLowerCase()) ||
        usage.name.toLowerCase().includes(item.name.toLowerCase())
      );
      // Get latest price for this item from priceHistory or pantryItem
      let price = null;
      if (pantryItem && pantryItem.price && !isNaN(pantryItem.price)) {
        price = parseFloat(pantryItem.price);
      }
      // Try to get latest price from priceHistory
      if (!price && priceHistory && priceHistory.itemSpend) {
        const priceHist = priceHistory.itemSpend.find(p => p.name && pantryItem && p.name.toLowerCase() === pantryItem.name.toLowerCase());
        if (priceHist && priceHist.lastPrice) price = priceHist.lastPrice;
      }
      // Calculate cost of used and remaining
      const usedCost = price ? usage.totalUsed * price : null;
      const remainingCost = price && pantryItem ? parseFloat(pantryItem.quantity) * price : null;
      return {
        ...usage,
        availableInPantry: !!pantryItem,
        pantryQuantity: pantryItem ? parseFloat(pantryItem.quantity) : 0,
        pantryUnit: pantryItem ? pantryItem.unit : null,
        impactLevel: pantryItem ? calculateImpactLevel(usage, pantryItem) : 'not-tracked',
        price,
        usedCost,
        remainingCost
      };
    });

    // Calculate calorie goal analysis
    const daysInPeriod = 7;
    const targetCaloriesPerWeek = savedCalorieGoal ? savedCalorieGoal * daysInPeriod : null;
    const calorieGoalAnalysis = savedCalorieGoal ? {
      dailyGoal: savedCalorieGoal,
      weeklyGoal: targetCaloriesPerWeek,
      actualWeekly: totalCaloriesConsumed,
      dailyAverage: totalCaloriesConsumed / daysInPeriod,
      goalAchievement: (totalCaloriesConsumed / targetCaloriesPerWeek) * 100,
      surplus: totalCaloriesConsumed - targetCaloriesPerWeek,
      dailySurplus: (totalCaloriesConsumed - targetCaloriesPerWeek) / daysInPeriod
    } : null;

    return {
      recipeFrequency,
      totalServings,
      totalCaloriesConsumed,
      calorieGoalAnalysis,
      ingredientUsage: Object.values(ingredientUsage),
      pantryImpact,
      mostUsedIngredients: Object.values(ingredientUsage)
        .sort((a, b) => b.timesUsed - a.timesUsed)
        .slice(0, 5),
      weekSummary: {
        recipesCooked: Object.keys(recipeFrequency).length,
        totalMeals: cookedRecipes.length,
        avgServingsPerMeal: totalServings / Math.max(cookedRecipes.length, 1)
      }
    };
  }, [reportData, macrosByRecipe, savedCalorieGoal]);

  // DEBUG: Log pantryImpact for inspection (after calculation)
  if (analysisData && analysisData.pantryImpact) {
    console.log('DEBUG pantryImpact:', analysisData.pantryImpact);
  }


  // Compute weekly spend and average per recipe
  const weeklySpend = useMemo(() => {
    if (!priceHistory) return null;
    return priceHistory.totalSpent || 0;
  }, [priceHistory]);

  const avgSpendPerRecipe = useMemo(() => {
    if (!priceHistory || !reportData) return null;
    const cooked = reportData.cookedRecipes;
    if (!cooked.length) return 0;
    // Try to map spend per recipe by linking pantry_item_id to ingredients in cooked recipes
    // Fallback: just divide total spent by number of cooked meals
    return (priceHistory.totalSpent || 0) / cooked.length;
  }, [priceHistory, reportData]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="reports-page loading">
        <div className="loading-spinner"></div>
        <p>Generating your weekly cooking report...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reports-page error">
        <h2>❌ Report Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  if (!reportData || !analysisData) {
    return (
      <div className="reports-page no-data">
        <h2>📊 Weekly Cooking Report</h2>
        <p>No cooking activity recorded in the past week.</p>
        <p>Start cooking some recipes to see your report!</p>
      </div>
    );
  }

  const { period, cookedRecipes } = reportData;
  const { 
    recipeFrequency, 
    totalServings, 
    totalCaloriesConsumed,
    calorieGoalAnalysis,
    pantryImpact, 
    mostUsedIngredients, 
    weekSummary 
  } = analysisData;

  return (
    <div className="reports-page">
      <div className="report-header">
        <h1>📊 Weekly Cooking Report</h1>
        <p className="report-period">
          {formatDate(period.start)} - {formatDate(period.end)}
        </p>
      </div>

      {/* Week Summary */}
      <div className="report-section summary-cards">
        <div className="summary-card">
          <div className="summary-number">{weekSummary.recipesCooked}</div>
          <div className="summary-label">Unique Recipes</div>
        </div>
        <div className="summary-card">
          <div className="summary-number">{weekSummary.totalMeals}</div>
          <div className="summary-label">Total Meals</div>
        </div>
        <div className="summary-card">
          <div className="summary-number">{totalServings}</div>
          <div className="summary-label">Total Servings</div>
        </div>
        <div className="summary-card">
          <div className="summary-number">{Math.round(totalCaloriesConsumed)}</div>
          <div className="summary-label">Calories Consumed</div>
        </div>
        <div className="summary-card">
          <div className="summary-number">${weeklySpend !== null ? weeklySpend.toFixed(2) : '...'}</div>
          <div className="summary-label">Money Spent (week)</div>
        </div>
        <div className="summary-card">
          <div className="summary-number">${avgSpendPerRecipe !== null ? avgSpendPerRecipe.toFixed(2) : '...'}</div>
          <div className="summary-label">Avg. Spend per Meal</div>
        </div>
      </div>

      {/* Calorie Goal Section */}
      {calorieGoalAnalysis ? (
        <div className="report-section">
          <h2>🔥 Calorie Goal Analysis</h2>
          <div className="calorie-goal-overview">
            <div className="calorie-goal-main">
              <div className="calorie-progress-circle">
                <div className="progress-circle" style={{
                  background: `conic-gradient(
                    ${calorieGoalAnalysis.goalAchievement >= 100 ? '#e74c3c' : 
                      calorieGoalAnalysis.goalAchievement >= 80 ? '#f39c12' : '#27ae60'} 
                    ${Math.min(calorieGoalAnalysis.goalAchievement, 100) * 3.6}deg,
                    #ecf0f1 0deg
                  )`
                }}>
                  <div className="progress-inner">
                    <div className="progress-percentage">
                      {Math.round(calorieGoalAnalysis.goalAchievement)}%
                    </div>
                    <div className="progress-label">of goal</div>
                  </div>
                </div>
              </div>
              <div className="calorie-goal-stats">
                <div className="calorie-stat">
                  <span className="stat-label">Daily Goal:</span>
                  <span className="stat-value">{calorieGoalAnalysis.dailyGoal} kcal</span>
                </div>
                <div className="calorie-stat">
                  <span className="stat-label">Daily Average:</span>
                  <span className="stat-value">{Math.round(calorieGoalAnalysis.dailyAverage)} kcal</span>
                </div>
                <div className="calorie-stat">
                  <span className="stat-label">Weekly Total:</span>
                  <span className="stat-value">{Math.round(calorieGoalAnalysis.actualWeekly)} kcal</span>
                </div>
                <div className={`calorie-stat ${calorieGoalAnalysis.surplus > 0 ? 'surplus' : 'deficit'}`}>
                  <span className="stat-label">
                    {calorieGoalAnalysis.surplus > 0 ? 'Surplus:' : 'Deficit:'}
                  </span>
                  <span className="stat-value">
                    {calorieGoalAnalysis.surplus > 0 ? '+' : ''}{Math.round(calorieGoalAnalysis.surplus)} kcal
                  </span>
                </div>
              </div>
            </div>
            <div className="calorie-goal-insights">
              {calorieGoalAnalysis.goalAchievement < 80 && (
                <div className="insight-card warning">
                  <h4>⚠️ Under Target</h4>
                  <p>You're consuming {Math.round(100 - calorieGoalAnalysis.goalAchievement)}% less than your goal. Consider adding more nutritious meals.</p>
                </div>
              )}
              {calorieGoalAnalysis.goalAchievement >= 80 && calorieGoalAnalysis.goalAchievement <= 110 && (
                <div className="insight-card success">
                  <h4>✅ On Track</h4>
                  <p>Great job! You're meeting your calorie goals consistently this week.</p>
                </div>
              )}
              {calorieGoalAnalysis.goalAchievement > 110 && (
                <div className="insight-card alert">
                  <h4>📈 Over Target</h4>
                  <p>You're consuming {Math.round(calorieGoalAnalysis.goalAchievement - 100)}% more than your goal. Consider portion control or lighter recipes.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="report-section">
          <h2>🔥 Calorie Goal Analysis</h2>
          <div className="no-calorie-goal">
            <div className="no-goal-icon">🎯</div>
            <h3>Set Your Calorie Goal</h3>
            <p>Track your calorie intake by setting up your daily calorie goal.</p>
            <button 
              className="set-goal-btn"
              onClick={() => onNavigate && onNavigate('calorie-goal')}
            >
              Set Calorie Goal
            </button>
          </div>
        </div>
      )}

      {/* Cooked Recipes Timeline */}
      <div className="report-section">
        <h2>🍳 Recipes Cooked This Week</h2>
        <div className="cooked-recipes-timeline">
          {cookedRecipes.map((record, index) => (
            <div key={index} className="timeline-item">
              <div className="timeline-date">{formatDate(record.cookedAt)}</div>
              <div className="timeline-content">
                <h3>{record.recipeName}</h3>
                <p>{record.servings || 1} serving{(record.servings || 1) !== 1 ? 's' : ''}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recipe Frequency */}
      <div className="report-section">
        <h2>🥇 Most Cooked Recipes</h2>
        <div className="frequency-chart">
          {Object.entries(recipeFrequency)
            .sort(([,a], [,b]) => b - a)
            .map(([recipeName, count]) => (
              <div key={recipeName} className="frequency-bar">
                <div className="frequency-label">{recipeName}</div>
                <div className="frequency-bar-container">
                  <div 
                    className="frequency-bar-fill"
                    style={{
                      width: `${(count / Math.max(...Object.values(recipeFrequency))) * 100}%`
                    }}
                  ></div>
                  <span className="frequency-count">{count}x</span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Most Used Ingredients */}
      <div className="report-section">
        <h2>🥕 Most Used Ingredients</h2>
        <div className="ingredients-list">
          {mostUsedIngredients.map((ingredient, index) => (
            <div key={index} className="ingredient-usage-item">
              <div className="ingredient-info">
                <span className="ingredient-name">{ingredient.name}</span>
                <span className="ingredient-stats">
                  Used {ingredient.timesUsed} time{ingredient.timesUsed !== 1 ? 's' : ''} 
                  • Total: {ingredient.totalUsed.toFixed(1)} {ingredient.unit}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pantry Impact Analysis */}
      <div className="report-section">
        <h2>🥫 Pantry Impact Analysis</h2>
        <div className="pantry-impact-grid">
          {pantryImpact
            .filter(item => item.availableInPantry)
            .sort((a, b) => {
              const impactOrder = { high: 4, medium: 3, low: 2, minimal: 1 };
              return impactOrder[b.impactLevel] - impactOrder[a.impactLevel];
            })
            .map((item, index) => (
              <div key={index} className={`impact-item impact-${item.impactLevel}`}>
                <div className="impact-header">
                  <span className="impact-ingredient">{item.name}</span>
                  <span className={`impact-badge impact-${item.impactLevel}`}>
                    {item.impactLevel} impact
                  </span>
                </div>
                <div className="impact-details">
                  <p>Used: {item.totalUsed.toFixed(1)} {item.unit}
                    {item.usedCost != null && (
                      <> &bull; Cost: ${item.usedCost.toFixed(2)}</>
                    )}
                  </p>
                  <p>Available: {item.pantryQuantity} {item.pantryUnit}
                    {item.remainingCost != null && (
                      <> &bull; Value: ${item.remainingCost.toFixed(2)}</>
                    )}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="report-section recommendations">
        <h2>💡 Recommendations</h2>
        <div className="recommendations-grid">
          {pantryImpact.filter(item => item.impactLevel === 'high').length > 0 && (
            <div className="recommendation-card warning">
              <h3>⚠️ Restock Alert</h3>
              <p>These ingredients are running low:</p>
              <ul>
                {pantryImpact
                  .filter(item => item.impactLevel === 'high')
                  .map((item, index) => (
                    <li key={index}>{item.name}</li>
                  ))}
              </ul>
            </div>
          )}

          {calorieGoalAnalysis && calorieGoalAnalysis.goalAchievement < 80 && (
            <div className="recommendation-card warning">
              <h3>🍽️ Calorie Boost</h3>
              <p>You're {Math.round(calorieGoalAnalysis.dailySurplus * -1)} calories short daily. Try adding healthy snacks or larger portions.</p>
            </div>
          )}

          {calorieGoalAnalysis && calorieGoalAnalysis.goalAchievement > 120 && (
            <div className="recommendation-card alert">
              <h3>⚖️ Portion Control</h3>
              <p>You're exceeding your goal by {Math.round(calorieGoalAnalysis.dailySurplus)} calories daily. Consider lighter recipes or smaller portions.</p>
            </div>
          )}
          
          {Object.keys(recipeFrequency).length < 3 && (
            <div className="recommendation-card suggestion">
              <h3>🌟 Variety Suggestion</h3>
              <p>Try cooking more variety! You only made {Object.keys(recipeFrequency).length} different recipe{Object.keys(recipeFrequency).length !== 1 ? 's' : ''} this week.</p>
            </div>
          )}
          
          <div className="recommendation-card tip">
            <h3>📝 Planning Tip</h3>
            <p>Based on your cooking patterns, consider meal prepping {Math.ceil(weekSummary.avgServingsPerMeal)} servings per recipe.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage; 
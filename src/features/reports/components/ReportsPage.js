import React, { useState, useEffect, useMemo } from 'react';
import { fetchWeeklyReport } from '../../../shared/api';
import { convertUnits, areUnitsCompatible } from '../../../utils/unitConversion';
import './ReportsPage.css';

const ReportsPage = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadReportData = async () => {
      try {
        setLoading(true);
        const data = await fetchWeeklyReport();
        setReportData(data);
      } catch (err) {
        setError('Failed to load report data');
        console.error('Error loading report:', err);
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
    const pantryImpact = Object.values(ingredientUsage).map(usage => {
      const pantryItem = pantryItems.find(item => 
        item.name.toLowerCase().includes(usage.name.toLowerCase()) ||
        usage.name.toLowerCase().includes(item.name.toLowerCase())
      );
      
      return {
        ...usage,
        availableInPantry: !!pantryItem,
        pantryQuantity: pantryItem ? parseFloat(pantryItem.quantity) : 0,
        pantryUnit: pantryItem ? pantryItem.unit : null,
        impactLevel: pantryItem ? calculateImpactLevel(usage, pantryItem) : 'not-tracked'
      };
    });

    return {
      recipeFrequency,
      totalServings,
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
  }, [reportData]);

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
          <div className="summary-number">{weekSummary.avgServingsPerMeal.toFixed(1)}</div>
          <div className="summary-label">Avg Servings/Meal</div>
        </div>
      </div>

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
                  <p>Used: {item.totalUsed.toFixed(1)} {item.unit}</p>
                  <p>Available: {item.pantryQuantity} {item.pantryUnit}</p>
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
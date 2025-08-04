import React, { useState } from 'react';
import './CaloricGoalPage.css';

const CaloricGoalPage = () => {
  const [unitSystem, setUnitSystem] = useState('metric');
  const [caloricGoalResult, setCaloricGoalResult] = useState(null);
  const [goal, setGoal] = useState('maintain'); // new

  return (
    <div className="caloric-goal-page-container">
      <div className="caloric-goal-section compact">
        <h3>Caloric Goal Calculator</h3>
        <div className="unit-toggle">
          <button
            type="button"
            className={unitSystem === 'metric' ? 'active' : ''}
            onClick={() => setUnitSystem('metric')}
          >
            Metric (kg/cm)
          </button>
          <button
            type="button"
            className={unitSystem === 'us' ? 'active' : ''}
            onClick={() => setUnitSystem('us')}
          >
            US (lb/in)
          </button>
        </div>
        <div className="goal-toggle">
          <button
            type="button"
            className={goal === 'cut' ? 'active' : ''}
            onClick={() => setGoal('cut')}
          >
            Cutting
          </button>
          <button
            type="button"
            className={goal === 'maintain' ? 'active' : ''}
            onClick={() => setGoal('maintain')}
          >
            Maintenance
          </button>
          <button
            type="button"
            className={goal === 'bulk' ? 'active' : ''}
            onClick={() => setGoal('bulk')}
          >
            Bulking
          </button>
        </div>
        <form
          className="caloric-goal-form"
          onSubmit={e => {
            e.preventDefault();
            let weight = parseFloat(e.target.weight.value);
            let height = parseFloat(e.target.height.value);
            const age = parseFloat(e.target.age.value);

            if (unitSystem === 'us') {
              weight = weight * 0.453592;
              height = height * 2.54;
            }

            if (weight && height && age) {
              const bmr = 10 * weight + 6.25 * height - 5 * age + 5;
              let calories = Math.round(bmr * 1.55);

              if (goal === 'cut') calories = Math.round(calories * 0.8);
              if (goal === 'bulk') calories = Math.round(calories * 1.15);

              setCaloricGoalResult(calories);
            }
          }}
        >
          <input
            type="number"
            name="weight"
            min="1"
            step="any"
            required
            placeholder={unitSystem === 'metric' ? "Weight (kg)" : "Weight (lb)"}
          />
          <input
            type="number"
            name="height"
            min="1"
            step="any"
            required
            placeholder={unitSystem === 'metric' ? "Height (cm)" : "Height (in)"}
          />
          <input
            type="number"
            name="age"
            min="1"
            step="1"
            required
            placeholder="Age"
          />
          <button type="submit">Calc</button>
        </form>
        {caloricGoalResult && (
          <div className="caloric-goal-result">
            <strong>{caloricGoalResult} kcal/day</strong>
            <div className="macro-recommendations">
              <div>
                <span>Protein:</span> {Math.round((caloricGoalResult * 0.25) / 4)}g
              </div>
              <div>
                <span>Carbs:</span> {Math.round((caloricGoalResult * 0.50) / 4)}g
              </div>
              <div>
                <span>Fat:</span> {Math.round((caloricGoalResult * 0.25) / 9)}g
              </div>
            </div>
            <div className="caloric-goal-note">
              <span>Estimates based on 25% protein, 50% carbs, 25% fat</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaloricGoalPage;
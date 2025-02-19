import React from 'react';

const UserInputs = ({
  income1,
  setIncome1,
  income2,
  setIncome2,
  incomeFrequency1,
  setIncomeFrequency1,
  incomeFrequency2,
  setIncomeFrequency2,
  expenses,
  setExpenses,
  expensesFrequency,
  setExpensesFrequency,
  projectionYears,
  setProjectionYears,
  compoundGrowthRate,
  setCompoundGrowthRate,
  handleCalculate,
}) => {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleCalculate();
      }}
    >
      <div className="inputGroup">
        <label>Income 1:</label>
        <input
          type="number"
          value={income1}
          onChange={(e) => setIncome1(e.target.value)}
          required
        />
        <select
          value={incomeFrequency1}
          onChange={(e) => setIncomeFrequency1(e.target.value)}
        >
          <option value="yearly">Yearly</option>
          <option value="monthly">Monthly</option>
          <option value="weekly">Weekly</option>
          <option value="daily">Daily</option>
        </select>
      </div>
      <div className="inputGroup">
        <label>Income 2:</label>
        <input
          type="number"
          value={income2}
          onChange={(e) => setIncome2(e.target.value)}
          required
        />
        <select
          value={incomeFrequency2}
          onChange={(e) => setIncomeFrequency2(e.target.value)}
        >
          <option value="yearly">Yearly</option>
          <option value="monthly">Monthly</option>
          <option value="weekly">Weekly</option>
          <option value="daily">Daily</option>
        </select>
      </div>
      <div className="inputGroup">
        <label>Expenses:</label>
        <input
          type="number"
          value={expenses}
          onChange={(e) => setExpenses(e.target.value)}
          required
        />
        <select
          value={expensesFrequency}
          onChange={(e) => setExpensesFrequency(e.target.value)}
        >
          <option value="yearly">Yearly</option>
          <option value="monthly">Monthly</option>
          <option value="weekly">Weekly</option>
          <option value="daily">Daily</option>
        </select>
      </div>
      <div className="inputGroup">
        <label>Projection Years:</label>
        <input
          type="number"
          value={projectionYears}
          onChange={(e) => setProjectionYears(e.target.value)}
          required
        />
      </div>
      <div className="inputGroup">
        <label>Compound Growth Rate (% per year):</label>
        <input
          type="number"
          value={compoundGrowthRate}
          onChange={(e) => setCompoundGrowthRate(e.target.value)}
          required
        />
      </div>
      <button type="submit" className="button">
        Calculate
      </button>
    </form>
  );
};

export default UserInputs;

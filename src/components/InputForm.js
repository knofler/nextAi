import React from 'react';
import styles from '../styles/Fintech.module.css';

const InputForm = ({
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
  fixedInterestSavings,
  setFixedInterestSavings,
  fixedInterestRate,
  setFixedInterestRate,
  fixedInterestFrequency,
  setFixedInterestFrequency,
  etfInvestment,
  setEtfInvestment,
  etfDividendReinvestment,
  setEtfDividendReinvestment,
  etfAnnualReturn,
  setEtfAnnualReturn,
  etfFrequency,
  setEtfFrequency,
  cryptoInvestment,
  setCryptoInvestment,
  cryptoGrowthRate,
  setCryptoGrowthRate,
  cryptoFrequency,
  setCryptoFrequency,
  sharesInvestment,
  setSharesInvestment,
  sharesGrowthRate,
  setSharesGrowthRate,
  sharesFrequency,
  setSharesFrequency,
  handleCalculate,
}) => {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleCalculate();
      }}
    >
      {/* Existing input fields for income, expenses, etc. */}
      <div className={styles.inputGroup}>
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
      <div className={styles.inputGroup}>
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
      <div className={styles.inputGroup}>
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
      <div className={styles.inputGroup}>
        <label>Projection Years:</label>
        <input
          type="number"
          value={projectionYears}
          onChange={(e) => setProjectionYears(e.target.value)}
          required
        />
      </div>
      <div className={styles.inputGroup}>
        <label>Compound Growth Rate:</label>
        <input
          type="number"
          value={compoundGrowthRate}
          onChange={(e) => setCompoundGrowthRate(e.target.value)}
          required
        />
      </div>

      <h2>Savings and Investment Options</h2>

      <div className={styles.inputGroup}>
        <label>Fixed Interest Savings:</label>
        <input
          type="number"
          value={fixedInterestSavings}
          onChange={(e) => setFixedInterestSavings(e.target.value)}
          required
        />
        <select
          value={fixedInterestFrequency}
          onChange={(e) => setFixedInterestFrequency(e.target.value)}
        >
          <option value="yearly">Yearly</option>
          <option value="monthly">Monthly</option>
          <option value="weekly">Weekly</option>
          <option value="daily">Daily</option>
        </select>
        <label>Interest Rate:</label>
        <input
          type="number"
          value={fixedInterestRate}
          onChange={(e) => setFixedInterestRate(e.target.value)}
          required
        />
      </div>

      <div className={styles.inputGroup}>
        <label>ETF Investment:</label>
        <input
          type="number"
          value={etfInvestment}
          onChange={(e) => setEtfInvestment(e.target.value)}
          required
        />
        <select
          value={etfFrequency}
          onChange={(e) => setEtfFrequency(e.target.value)}
        >
          <option value="yearly">Yearly</option>
          <option value="monthly">Monthly</option>
          <option value="weekly">Weekly</option>
          <option value="daily">Daily</option>
        </select>
        <label>Annual Return:</label>
        <input
          type="number"
          value={etfAnnualReturn}
          onChange={(e) => setEtfAnnualReturn(e.target.value)}
          required
        />
        <label>
          <input
            type="checkbox"
            checked={etfDividendReinvestment}
            onChange={(e) => setEtfDividendReinvestment(e.target.checked)}
          />
          Reinvest Dividends
        </label>
      </div>

      <div className={styles.inputGroup}>
        <label>Crypto Investment:</label>
        <input
          type="number"
          value={cryptoInvestment}
          onChange={(e) => setCryptoInvestment(e.target.value)}
          required
        />
        <select
          value={cryptoFrequency}
          onChange={(e) => setCryptoFrequency(e.target.value)}
        >
          <option value="yearly">Yearly</option>
          <option value="monthly">Monthly</option>
          <option value="weekly">Weekly</option>
          <option value="daily">Daily</option>
        </select>
        <label>Growth Rate:</label>
        <input
          type="number"
          value={cryptoGrowthRate}
          onChange={(e) => setCryptoGrowthRate(e.target.value)}
          required
        />
      </div>

      <div className={styles.inputGroup}>
        <label>Shares Investment:</label>
        <input
          type="number"
          value={sharesInvestment}
          onChange={(e) => setSharesInvestment(e.target.value)}
          required
        />
        <select
          value={sharesFrequency}
          onChange={(e) => setSharesFrequency(e.target.value)}
        >
          <option value="yearly">Yearly</option>
          <option value="monthly">Monthly</option>
          <option value="weekly">Weekly</option>
          <option value="daily">Daily</option>
        </select>
        <label>Growth Rate:</label>
        <input
          type="number"
          value={sharesGrowthRate}
          onChange={(e) => setSharesGrowthRate(e.target.value)}
          required
        />
      </div>

      <button type="submit" className={styles.button}>
        Calculate
      </button>
    </form>
  );
};

export default InputForm;
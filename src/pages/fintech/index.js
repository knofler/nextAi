import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import styles from '../../styles/Fintech.module.css';

// Register the required components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Fintech = () => {
  const [income, setIncome] = useState('');
  const [incomeFrequency, setIncomeFrequency] = useState('yearly');
  const [expenses, setExpenses] = useState('');
  const [expensesFrequency, setExpensesFrequency] = useState('yearly');
  const [projectionYears, setProjectionYears] = useState(1);
  const [compoundGrowthRate, setCompoundGrowthRate] = useState(0);

  // Savings and investment options
  const [fixedInterestSavings, setFixedInterestSavings] = useState('');
  const [fixedInterestRate, setFixedInterestRate] = useState(0);
  const [etfInvestment, setEtfInvestment] = useState('');
  const [etfDividendReinvestment, setEtfDividendReinvestment] = useState(false);
  const [etfAnnualReturn, setEtfAnnualReturn] = useState(0);
  const [cryptoInvestment, setCryptoInvestment] = useState('');
  const [cryptoGrowthRate, setCryptoGrowthRate] = useState(0);
  const [sharesInvestment, setSharesInvestment] = useState('');
  const [sharesGrowthRate, setSharesGrowthRate] = useState(0);

  const [projections, setProjections] = useState([]);
  const [compoundProjections, setCompoundProjections] = useState([]);

  const handleCalculate = () => {
    const monthlyIncome = income / getFrequencyDivider(incomeFrequency);
    const monthlyExpenses = expenses / getFrequencyDivider(expensesFrequency);
    const monthlyAvailableSavings = monthlyIncome - monthlyExpenses;

    const monthlyFixedInterestSavings = fixedInterestSavings / getFrequencyDivider('monthly');
    const monthlyEtfInvestment = etfInvestment / getFrequencyDivider('monthly');
    const monthlyCryptoInvestment = cryptoInvestment / getFrequencyDivider('monthly');
    const monthlySharesInvestment = sharesInvestment / getFrequencyDivider('monthly');

    const projection = [];
    const compoundProjection = [];
    let totalSavings = 0;
    let totalCompoundSavings = 0;

    for (let i = 1; i <= projectionYears * 12; i++) {
      totalSavings += monthlyAvailableSavings;
      totalCompoundSavings = (totalCompoundSavings + monthlyAvailableSavings) * (1 + compoundGrowthRate / 100 / 12);

      // Fixed interest savings
      const fixedInterest = monthlyFixedInterestSavings * (1 + fixedInterestRate / 100 / 12);

      // ETF investment
      const etfReturn = monthlyEtfInvestment * (1 + etfAnnualReturn / 100 / 12);
      const etfReinvestment = etfDividendReinvestment ? etfReturn : 0;

      // Crypto investment
      const cryptoReturn = monthlyCryptoInvestment * (1 + cryptoGrowthRate / 100 / 12);

      // Shares investment
      const sharesReturn = monthlySharesInvestment * (1 + sharesGrowthRate / 100 / 12);

      projection.push({
        month: i,
        savings: totalSavings + fixedInterest + etfReinvestment + cryptoReturn + sharesReturn,
      });
      compoundProjection.push({
        month: i,
        savings: totalCompoundSavings + fixedInterest + etfReinvestment + cryptoReturn + sharesReturn,
      });
    }

    setProjections(projection);
    setCompoundProjections(compoundProjection);
  };

  const getFrequencyDivider = (frequency) => {
    switch (frequency) {
      case 'yearly':
        return 12;
      case 'monthly':
        return 1;
      case 'weekly':
        return 1 / 4.34524;
      case 'daily':
        return 1 / 30.4368;
      default:
        return 1;
    }
  };

  const getLabels = () => {
    if (projectionYears > 1) {
      return Array.from({ length: projectionYears }, (_, i) => `Year ${i + 1}`);
    } else {
      return projections.map((p) => `Month ${p.month}`);
    }
  };

  const data = {
    labels: getLabels(),
    datasets: [
      {
        label: 'Savings Projection',
        data: projections.map((p) => p.savings),
        fill: false,
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
      },
      {
        label: 'Compound Savings Projection',
        data: compoundProjections.map((p) => p.savings),
        fill: false,
        backgroundColor: 'rgba(153,102,255,0.4)',
        borderColor: 'rgba(153,102,255,1)',
      },
    ],
  };

  useEffect(() => {
    handleCalculate();
  }, [
    income,
    incomeFrequency,
    expenses,
    expensesFrequency,
    projectionYears,
    compoundGrowthRate,
    fixedInterestSavings,
    fixedInterestRate,
    etfInvestment,
    etfDividendReinvestment,
    etfAnnualReturn,
    cryptoInvestment,
    cryptoGrowthRate,
    sharesInvestment,
    sharesGrowthRate,
  ]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Simple Web-Based Calculator MVP</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleCalculate();
        }}
      >
        <div className={styles.inputGroup}>
          <label>Income:</label>
          <input
            type="number"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            required
          />
          <select
            value={incomeFrequency}
            onChange={(e) => setIncomeFrequency(e.target.value)}
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
          <label>Compound Growth Rate (% per year):</label>
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
          <label>Interest Rate (% per year):</label>
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
          <label>Annual Return (% per year):</label>
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
          <label>Growth Rate (% per year):</label>
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
          <label>Growth Rate (% per year):</label>
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
      {projections.length > 0 && (
        <div className={styles.chartContainer}>
          <Line data={data} />
        </div>
      )}
    </div>
  );
};

export default Fintech;
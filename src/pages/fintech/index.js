import React, { useState, useEffect } from 'react';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
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
  Legend,
  ArcElement
);

const getFrequencyMultiplier = (frequency) => {
  switch (frequency) {
    case 'yearly':
      return 1;
    case 'monthly':
      return 12;
    case 'weekly':
      return 52;
    case 'daily':
      return 365;
    default:
      return 1;
  }
};

const calculateTax = (income) => {
  if (income <= 18200) {
    return 0;
  } else if (income <= 45000) {
    return (income - 18200) * 0.16;
  } else if (income <= 135000) {
    return (45000 - 18200) * 0.16 + (income - 45000) * 0.30;
  } else if (income <= 190000) {
    return (45000 - 18200) * 0.16 + (135000 - 45000) * 0.30 + (income - 135000) * 0.37;
  } else {
    return (45000 - 18200) * 0.16 + (135000 - 45000) * 0.30 + (190000 - 135000) * 0.37 + (income - 190000) * 0.45;
  }
};

const Fintech = () => {
  const [income1, setIncome1] = useState('');
  const [income2, setIncome2] = useState('');
  const [incomeFrequency1, setIncomeFrequency1] = useState('yearly');
  const [incomeFrequency2, setIncomeFrequency2] = useState('yearly');
  const [expenses, setExpenses] = useState('');
  const [expensesFrequency, setExpensesFrequency] = useState('monthly');
  const [projectionYears, setProjectionYears] = useState(1);
  const [compoundGrowthRate, setCompoundGrowthRate] = useState(0);

  // Savings and investment options
  const [fixedInterestSavings, setFixedInterestSavings] = useState('');
  const [fixedInterestRate, setFixedInterestRate] = useState(0);
  const [fixedInterestFrequency, setFixedInterestFrequency] = useState('monthly');
  const [etfInvestment, setEtfInvestment] = useState('');
  const [etfDividendReinvestment, setEtfDividendReinvestment] = useState(false);
  const [etfAnnualReturn, setEtfAnnualReturn] = useState(0);
  const [etfFrequency, setEtfFrequency] = useState('monthly');
  const [cryptoInvestment, setCryptoInvestment] = useState('');
  const [cryptoGrowthRate, setCryptoGrowthRate] = useState(0);
  const [cryptoFrequency, setCryptoFrequency] = useState('monthly');
  const [sharesInvestment, setSharesInvestment] = useState('');
  const [sharesGrowthRate, setSharesGrowthRate] = useState(0);
  const [sharesFrequency, setSharesFrequency] = useState('monthly');

  const [projections, setProjections] = useState([]);
  const [compoundProjections, setCompoundProjections] = useState([]);
  const [pieData, setPieData] = useState({});

  const annualIncome1 = income1 * getFrequencyMultiplier(incomeFrequency1);
  const annualIncome2 = income2 * getFrequencyMultiplier(incomeFrequency2);
  const annualExpenses = expenses * getFrequencyMultiplier(expensesFrequency);

  const annualTax1 = calculateTax(annualIncome1);
  const annualTax2 = calculateTax(annualIncome2);

  const totalIncome = annualIncome1 + annualIncome2;
  const totalTax = annualTax1 + annualTax2;
  const annualAvailableSavings = totalIncome - totalTax - annualExpenses;

  const handleCalculate = () => {
    const totalAllocatedSavings =
      parseFloat(fixedInterestSavings) * getFrequencyMultiplier(fixedInterestFrequency) +
      parseFloat(etfInvestment) * getFrequencyMultiplier(etfFrequency) +
      parseFloat(cryptoInvestment) * getFrequencyMultiplier(cryptoFrequency) +
      parseFloat(sharesInvestment) * getFrequencyMultiplier(sharesFrequency);

    if (totalAllocatedSavings > annualAvailableSavings) {
      alert('Total allocated savings exceed available savings after expenses.');
      return;
    }

    const projection = [];
    const compoundProjection = [];
    let totalSavings = 0;
    let totalCompoundSavings = 0;

    let fixedInterestTotal = 0;
    let etfTotal = 0;
    let cryptoTotal = 0;
    let sharesTotal = 0;

    for (let i = 1; i <= projectionYears; i++) {
      totalSavings += annualAvailableSavings;
      totalCompoundSavings = (totalCompoundSavings + annualAvailableSavings) * (1 + compoundGrowthRate / 100);

      // Fixed interest savings
      const fixedInterest = fixedInterestSavings * getFrequencyMultiplier(fixedInterestFrequency) * Math.pow(1 + fixedInterestRate / 100, i);
      fixedInterestTotal += fixedInterest;

      // ETF investment
      const etfReturn = etfInvestment * getFrequencyMultiplier(etfFrequency) * Math.pow(1 + etfAnnualReturn / 100, i);
      const etfReinvestment = etfDividendReinvestment ? etfReturn : 0;
      etfTotal += etfReturn + etfReinvestment;

      // Crypto investment
      const cryptoReturn = cryptoInvestment * getFrequencyMultiplier(cryptoFrequency) * Math.pow(1 + cryptoGrowthRate / 100, i);
      cryptoTotal += cryptoReturn;

      // Shares investment
      const sharesReturn = sharesInvestment * getFrequencyMultiplier(sharesFrequency) * Math.pow(1 + sharesGrowthRate / 100, i);
      sharesTotal += sharesReturn;

      projection.push({
        year: i,
        savings: totalSavings,
        investmentReturn: fixedInterestTotal + etfTotal + cryptoTotal + sharesTotal,
      });
      compoundProjection.push({
        year: i,
        savings: totalCompoundSavings,
        investmentReturn: fixedInterestTotal + etfTotal + cryptoTotal + sharesTotal,
      });
    }

    setProjections(projection);
    setCompoundProjections(compoundProjection);

    // Update pie chart data
    setPieData({
      labels: ['Fixed Interest', 'ETF', 'Crypto', 'Shares'],
      datasets: [
        {
          data: [fixedInterestTotal, etfTotal, cryptoTotal, sharesTotal],
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
        },
      ],
    });
  };

  const handleSavingsChange = (setter, value, frequency) => {
    const totalAllocatedSavings =
      parseFloat(fixedInterestSavings) * getFrequencyMultiplier(fixedInterestFrequency) +
      parseFloat(etfInvestment) * getFrequencyMultiplier(etfFrequency) +
      parseFloat(cryptoInvestment) * getFrequencyMultiplier(cryptoFrequency) +
      parseFloat(sharesInvestment) * getFrequencyMultiplier(sharesFrequency);

    const remainingSavings = annualAvailableSavings - totalAllocatedSavings + parseFloat(value) * getFrequencyMultiplier(frequency);

    if (remainingSavings < 0) {
      alert('Total allocated savings exceed available savings after expenses.');
      return;
    }

    setter(value);
  };

  const getLabels = () => {
    return Array.from({ length: projectionYears }, (_, i) => `Year ${i + 1}`);
  };

  const lineData = {
    labels: getLabels(),
    datasets: [
      {
        label: 'Savings Without Investment',
        data: projections.map((p) => p.savings),
        fill: false,
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
        borderWidth: 2,
      },
      {
        label: 'Total Return on Investment',
        data: projections.map((p) => p.investmentReturn),
        fill: false,
        backgroundColor: 'rgba(153,102,255,0.4)',
        borderColor: 'rgba(153,102,255,1)',
        borderWidth: 2,
        borderDash: [5, 5],
      },
    ],
  };

  useEffect(() => {
    handleCalculate();
  }, [
    income1,
    income2,
    incomeFrequency1,
    incomeFrequency2,
    expenses,
    expensesFrequency,
    projectionYears,
    compoundGrowthRate,
    fixedInterestSavings,
    fixedInterestRate,
    fixedInterestFrequency,
    etfInvestment,
    etfDividendReinvestment,
    etfAnnualReturn,
    etfFrequency,
    cryptoInvestment,
    cryptoGrowthRate,
    cryptoFrequency,
    sharesInvestment,
    sharesGrowthRate,
    sharesFrequency,
  ]);

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <div className={styles.calculator}>
          <h1 className={styles.title}>Simple Web-Based Calculator MVP</h1>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCalculate();
            }}
          >
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
                onChange={(e) => handleSavingsChange(setFixedInterestSavings, e.target.value, fixedInterestFrequency)}
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
                onChange={(e) => handleSavingsChange(setEtfInvestment, e.target.value, etfFrequency)}
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
                onChange={(e) => handleSavingsChange(setCryptoInvestment, e.target.value, cryptoFrequency)}
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
                onChange={(e) => handleSavingsChange(setSharesInvestment, e.target.value, sharesFrequency)}
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
          <div className={styles.summary}>
            <h2>Summary</h2>
            <p>Total Income: ${totalIncome.toFixed(2)}</p>
            <p>Total Tax: ${totalTax.toFixed(2)}</p>
            <p>Total Expenses: ${annualExpenses.toFixed(2)}</p>
            <p>Total Fund Available for Investment: ${annualAvailableSavings.toFixed(2)}</p>
          </div>
        </div>
      </div>
      <div className={styles.rightPanel}>
        {projections.length > 0 && (
          <>
            <div className={styles.chartContainer}>
              <Line data={lineData} options={{ maintainAspectRatio: false }} />
            </div>
            <div className={styles.chartContainer}>
              <Pie data={pieData} options={{ maintainAspectRatio: false }} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Fintech;
import React, { useState, useEffect } from 'react';
import InputForm from '../../components/InputForm';
import Summary from '../../components/Summary';
import Charts from '../../components/Charts';
import Super from '../../components/Super';
import Mortgage from '../../components/Mortgage';
import {
  getFrequencyMultiplier,
  calculateTax,
  calculateAnnualIncome,
  calculateAnnualExpenses,
  calculateAnnualAvailableSavings,
  calculateTotalAllocatedSavings,
  calculateProjections,
} from '../../components/FinancialCalculations';
import styles from '../../styles/Fintech.module.css';

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

  const annualIncome1 = calculateAnnualIncome(income1 || 0, incomeFrequency1);
  const annualIncome2 = calculateAnnualIncome(income2 || 0, incomeFrequency2);
  const annualExpenses = calculateAnnualExpenses(expenses || 0, expensesFrequency);

  const annualTax1 = calculateTax(annualIncome1);
  const annualTax2 = calculateTax(annualIncome2);

  const totalIncome = annualIncome1 + annualIncome2;
  const totalTax = annualTax1 + annualTax2;
  const annualAvailableSavings = calculateAnnualAvailableSavings(totalIncome, totalTax, annualExpenses);

  const handleCalculate = () => {
    const totalAllocatedSavings = calculateTotalAllocatedSavings(
      fixedInterestSavings || 0,
      fixedInterestFrequency,
      etfInvestment || 0,
      etfFrequency,
      cryptoInvestment || 0,
      cryptoFrequency,
      sharesInvestment || 0,
      sharesFrequency
    );

    const { projection, compoundProjection, fixedInterestTotal, etfTotal, cryptoTotal, sharesTotal } = calculateProjections(
      annualAvailableSavings,
      totalAllocatedSavings,
      projectionYears,
      compoundGrowthRate,
      fixedInterestSavings || 0,
      fixedInterestRate,
      fixedInterestFrequency,
      etfInvestment || 0,
      etfAnnualReturn,
      etfFrequency,
      etfDividendReinvestment,
      cryptoInvestment || 0,
      cryptoGrowthRate,
      cryptoFrequency,
      sharesInvestment || 0,
      sharesGrowthRate,
      sharesFrequency
    );

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
          <InputForm
            income1={income1}
            setIncome1={setIncome1}
            income2={income2}
            setIncome2={setIncome2}
            incomeFrequency1={incomeFrequency1}
            setIncomeFrequency1={setIncomeFrequency1}
            incomeFrequency2={incomeFrequency2}
            setIncomeFrequency2={setIncomeFrequency2}
            expenses={expenses}
            setExpenses={setExpenses}
            expensesFrequency={expensesFrequency}
            setExpensesFrequency={setExpensesFrequency}
            projectionYears={projectionYears}
            setProjectionYears={setProjectionYears}
            compoundGrowthRate={compoundGrowthRate}
            setCompoundGrowthRate={setCompoundGrowthRate}
            fixedInterestSavings={fixedInterestSavings}
            setFixedInterestSavings={setFixedInterestSavings}
            fixedInterestRate={fixedInterestRate}
            setFixedInterestRate={setFixedInterestRate}
            fixedInterestFrequency={fixedInterestFrequency}
            setFixedInterestFrequency={setFixedInterestFrequency}
            etfInvestment={etfInvestment}
            setEtfInvestment={setEtfInvestment}
            etfDividendReinvestment={etfDividendReinvestment}
            setEtfDividendReinvestment={setEtfDividendReinvestment}
            etfAnnualReturn={etfAnnualReturn}
            setEtfAnnualReturn={setEtfAnnualReturn}
            etfFrequency={etfFrequency}
            setEtfFrequency={setEtfFrequency}
            cryptoInvestment={cryptoInvestment}
            setCryptoInvestment={setCryptoInvestment}
            cryptoGrowthRate={cryptoGrowthRate}
            setCryptoGrowthRate={setCryptoGrowthRate}
            cryptoFrequency={cryptoFrequency}
            setCryptoFrequency={setCryptoFrequency}
            sharesInvestment={sharesInvestment}
            setSharesInvestment={setSharesInvestment}
            sharesGrowthRate={sharesGrowthRate}
            setSharesGrowthRate={setSharesGrowthRate}
            sharesFrequency={sharesFrequency}
            setSharesFrequency={setSharesFrequency}
            handleCalculate={handleCalculate}
          />
          <Summary
            totalIncome={totalIncome}
            totalTax={totalTax}
            annualExpenses={annualExpenses}
            annualAvailableSavings={annualAvailableSavings}
          />
        </div>
        <Super />
        <Mortgage />
      </div>
      <div className={styles.rightPanel}>
        {projections.length > 0 && (
          <Charts projections={projections} pieData={pieData} />
        )}
      </div>
    </div>
  );
};

export default Fintech;
import React from 'react';
import styles from '../styles/Fintech.module.css';

const Summary = ({ totalIncome, totalTax, annualExpenses, annualAvailableSavings }) => {
  return (
    <div className={styles.summary}>
      <h2>Summary</h2>
      <p>Total Income: ${totalIncome.toFixed(2)}</p>
      <p>Total Tax: ${totalTax.toFixed(2)}</p>
      <p>Annual Expenses: ${annualExpenses.toFixed(2)}</p>
      <p>Annual Available Savings: ${annualAvailableSavings.toFixed(2)}</p>
    </div>
  );
};

export default Summary;
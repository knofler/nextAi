import React from 'react';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';
import styles from '../styles/Fintech.module.css'; // Import the CSS module

// Register the necessary components
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

const LineChart = ({ projections }) => {
  const getLabels = () => {
    return projections.map((p) => `Year ${p.year}`);
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

  return <Line data={lineData} options={{ maintainAspectRatio: false }} />;
};

const PieChart = ({ pieData }) => {
  return <Pie data={pieData} options={{ maintainAspectRatio: false }} />;
};

const Charts = ({ projections, pieData }) => {
  return (
    <div className={styles.charts}>
      <div className={styles.chartContainer}>
        <LineChart projections={projections} />
      </div>
      <div className={styles.chartContainer}>
        <PieChart pieData={pieData} />
      </div>
    </div>
  );
};

export default Charts;
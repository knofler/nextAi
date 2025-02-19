import React from 'react';
import { Line } from 'react-chartjs-2';

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

export default LineChart;

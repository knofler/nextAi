import React from 'react';
import { Pie } from 'react-chartjs-2';

const PieChart = ({ pieData }) => {
  return <Pie data={pieData} options={{ maintainAspectRatio: false }} />;
};

export default PieChart;

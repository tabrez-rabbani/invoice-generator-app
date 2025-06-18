'use client';

import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

const InvoiceStatusChart = ({ counts }) => {
  // Default empty data if none provided
  const statusCounts = counts || { paid: 0, pending: 0, overdue: 0, cancelled: 0 };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Invoice Status Distribution',
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '70%',
  };

  const data = {
    labels: ['Paid', 'Pending', 'Overdue', 'Cancelled'],
    datasets: [
      {
        data: [
          statusCounts.paid || 0,
          statusCounts.pending || 0,
          statusCounts.overdue || 0,
          statusCounts.cancelled || 0
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.7)',  // Green for Paid
          'rgba(255, 206, 86, 0.7)',  // Yellow for Pending
          'rgba(255, 99, 132, 0.7)',  // Red for Overdue
          'rgba(201, 203, 207, 0.7)', // Grey for Cancelled
        ],
        borderColor: [
          'rgb(75, 192, 192)',
          'rgb(255, 206, 86)',
          'rgb(255, 99, 132)',
          'rgb(201, 203, 207)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 h-80">
      <Doughnut options={options} data={data} />
    </div>
  );
};

export default InvoiceStatusChart;

'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const MonthlyInvoiceChart = ({ monthlyData }) => {
  // Default empty data if none provided
  const chartData = monthlyData || [];
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Invoice Amounts',
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', { 
                style: 'currency', 
                currency: 'USD' 
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return new Intl.NumberFormat('en-US', { 
              style: 'currency', 
              currency: 'USD',
              maximumSignificantDigits: 3
            }).format(value);
          }
        }
      }
    }
  };

  const data = {
    labels: chartData.map(d => d.month),
    datasets: [
      {
        label: 'Paid',
        data: chartData.map(d => d.paid),
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1,
      },
      {
        label: 'Pending',
        data: chartData.map(d => d.pending),
        backgroundColor: 'rgba(255, 206, 86, 0.7)',
        borderColor: 'rgb(255, 206, 86)',
        borderWidth: 1,
      },
      {
        label: 'Overdue',
        data: chartData.map(d => d.overdue),
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 h-80">
      <Bar options={options} data={data} />
    </div>
  );
};

export default MonthlyInvoiceChart;

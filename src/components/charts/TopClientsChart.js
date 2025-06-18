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

const TopClientsChart = ({ topClients }) => {
  // Default empty data if none provided
  const clientsData = topClients || [];
  
  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Top Clients by Invoice Amount',
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
            if (context.parsed.x !== null) {
              label += new Intl.NumberFormat('en-US', { 
                style: 'currency', 
                currency: 'USD' 
              }).format(context.parsed.x);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
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
      },
      y: {
        grid: {
          display: false,
        },
      }
    }
  };

  // Truncate long client names
  const truncateClientName = (name, maxLength = 20) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
  };

  const data = {
    labels: clientsData.map(client => truncateClientName(client.name)),
    datasets: [
      {
        data: clientsData.map(client => client.amount),
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgb(54, 162, 235)',
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

export default TopClientsChart;

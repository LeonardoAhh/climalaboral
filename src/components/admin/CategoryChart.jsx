import { useEffect, useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { categoryInfo } from '../../data/surveyQuestions';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CategoryChart = ({ data }) => {
    const chartRef = useRef(null);

    const categories = Object.keys(data);
    const values = Object.values(data);

    const chartData = {
        labels: categories.map(cat => categoryInfo[cat]?.name || cat),
        datasets: [
            {
                label: 'Promedio',
                data: values,
                backgroundColor: categories.map(cat => categoryInfo[cat]?.color || '#6366f1'),
                borderColor: categories.map(cat => categoryInfo[cat]?.color || '#6366f1'),
                borderWidth: 2,
                borderRadius: 8,
                barThickness: 50,
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                titleFont: {
                    size: 14,
                    weight: 'bold'
                },
                bodyFont: {
                    size: 13
                },
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                callbacks: {
                    label: function (context) {
                        return `Promedio: ${context.parsed.y.toFixed(2)} / 5.00`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 5,
                ticks: {
                    stepSize: 1,
                    font: {
                        size: 12
                    },
                    color: '#6b7280'
                },
                grid: {
                    color: '#e5e7eb',
                    drawBorder: false
                }
            },
            x: {
                ticks: {
                    font: {
                        size: 12,
                        weight: '600'
                    },
                    color: '#374151'
                },
                grid: {
                    display: false
                }
            }
        },
        animation: {
            duration: 1000,
            easing: 'easeInOutQuart'
        }
    };

    return (
        <div style={{ height: '400px', position: 'relative' }}>
            <Bar ref={chartRef} data={chartData} options={options} />
        </div>
    );
};

export default CategoryChart;

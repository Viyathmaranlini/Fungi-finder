import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title } from 'chart.js';
import { Pie, Bar, Line, Doughnut } from 'react-chartjs-2';
import './Dashboard.css';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title);

function Dashboard() {
  const [stats, setStats] = useState({
    totalIdentifications: 156,
    totalUsers: 45,
    edibleFound: 78,
    poisonousFound: 23,
    suspiciousFound: 55,
    todayIdentifications: 12,
    weeklyIdentifications: 67,
    monthlyIdentifications: 156
  });

  const [recentActivity, setRecentActivity] = useState([
    { id: 1, species: 'Agaricus bisporus', toxicity: 'edible', user: 'John D.', time: '2 min ago' },
    { id: 2, species: 'Amanita phalloides', toxicity: 'poisonous', user: 'Sarah M.', time: '15 min ago' },
    { id: 3, species: 'Boletus edulis', toxicity: 'edible', user: 'Mike R.', time: '1 hour ago' },
    { id: 4, species: 'Cortinarius rubellus', toxicity: 'poisonous', user: 'Emma L.', time: '2 hours ago' },
    { id: 5, species: 'Lactarius deliciosus', toxicity: 'suspicious', user: 'David K.', time: '3 hours ago' },
  ]);

  // Toxicity Distribution Chart
  const toxicityData = {
    labels: ['Edible', 'Suspicious', 'Poisonous'],
    datasets: [{
      data: [stats.edibleFound, stats.suspiciousFound, stats.poisonousFound],
      backgroundColor: ['#00b894', '#fdcb6e', '#ff7675'],
      borderColor: ['#00a884', '#f0b93d', '#ff5252'],
      borderWidth: 2,
    }]
  };

  // Weekly Identifications Chart
  const weeklyData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Identifications',
      data: [12, 19, 8, 15, 22, 30, 18],
      backgroundColor: 'rgba(0, 184, 148, 0.5)',
      borderColor: '#00b894',
      borderWidth: 2,
      borderRadius: 8,
    }]
  };

  // Monthly Trend Chart
  const monthlyTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Identifications',
      data: [45, 62, 78, 95, 120, 156],
      borderColor: '#00b894',
      backgroundColor: 'rgba(0, 184, 148, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#00b894',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 6,
    }]
  };

  // Species Distribution Chart
  const speciesData = {
    labels: ['Agaricus', 'Amanita', 'Boletus', 'Lactarius', 'Russula', 'Others'],
    datasets: [{
      data: [35, 15, 25, 20, 18, 43],
      backgroundColor: [
        '#00b894',
        '#ff7675',
        '#74b9ff',
        '#fdcb6e',
        '#a29bfe',
        '#636e72'
      ],
      borderWidth: 0,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: { size: 12 }
        }
      }
    }
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { color: 'rgba(255, 255, 255, 0.7)' }
      },
      x: {
        grid: { display: false },
        ticks: { color: 'rgba(255, 255, 255, 0.7)' }
      }
    }
  };

  const getToxicityIcon = (toxicity) => {
    switch (toxicity) {
      case 'edible': return '✅';
      case 'poisonous': return '☠️';
      default: return '⚠️';
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>📊 Analytics Dashboard</h1>
          <p>Real-time statistics and monitoring</p>
        </div>
        <div className="header-actions">
          <button className="refresh-btn">🔄 Refresh</button>
          <button className="export-btn">📥 Export Report</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">🍄</div>
          <div className="stat-info">
            <h3>{stats.totalIdentifications}</h3>
            <p>Total Identifications</p>
          </div>
          <div className="stat-trend up">↑ 12%</div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{stats.edibleFound}</h3>
            <p>Edible Found</p>
          </div>
          <div className="stat-trend up">↑ 8%</div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <h3>{stats.suspiciousFound}</h3>
            <p>Suspicious Found</p>
          </div>
          <div className="stat-trend down">↓ 3%</div>
        </div>

        <div className="stat-card danger">
          <div className="stat-icon">☠️</div>
          <div className="stat-info">
            <h3>{stats.poisonousFound}</h3>
            <p>Poisonous Found</p>
          </div>
          <div className="stat-trend up">↑ 5%</div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{stats.totalUsers}</h3>
            <p>Total Users</p>
          </div>
          <div className="stat-trend up">↑ 15%</div>
        </div>

        <div className="stat-card secondary">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <h3>{stats.todayIdentifications}</h3>
            <p>Today's IDs</p>
          </div>
          <div className="stat-trend up">↑ 20%</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>🥧 Toxicity Distribution</h3>
          <div className="chart-container">
            <Doughnut data={toxicityData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-card">
          <h3>📊 Weekly Identifications</h3>
          <div className="chart-container">
            <Bar data={weeklyData} options={barOptions} />
          </div>
        </div>

        <div className="chart-card wide">
          <h3>📈 Monthly Trend</h3>
          <div className="chart-container">
            <Line data={monthlyTrendData} options={barOptions} />
          </div>
        </div>

        <div className="chart-card">
          <h3>🍄 Species Distribution</h3>
          <div className="chart-container">
            <Pie data={speciesData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="activity-section">
        <div className="activity-card">
          <h3>🕐 Recent Activity</h3>
          <div className="activity-list">
            {recentActivity.map((activity) => (
              <div key={activity.id} className={`activity-item ${activity.toxicity}`}>
                <span className="activity-icon">{getToxicityIcon(activity.toxicity)}</span>
                <div className="activity-details">
                  <h4>{activity.species}</h4>
                  <p>Identified by {activity.user}</p>
                </div>
                <span className="activity-time">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="quick-stats-card">
          <h3>⚡ Quick Stats</h3>
          <div className="quick-stats-list">
            <div className="quick-stat-item">
              <span className="label">Average Confidence</span>
              <span className="value">78.5%</span>
            </div>
            <div className="quick-stat-item">
              <span className="label">Most Identified</span>
              <span className="value">Agaricus</span>
            </div>
            <div className="quick-stat-item">
              <span className="label">Active Regions</span>
              <span className="value">12</span>
            </div>
            <div className="quick-stat-item">
              <span className="label">This Week</span>
              <span className="value">{stats.weeklyIdentifications}</span>
            </div>
            <div className="quick-stat-item">
              <span className="label">Success Rate</span>
              <span className="value">94.2%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
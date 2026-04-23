import React, { useState, useEffect, useCallback } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Filler } from 'chart.js';
import { Pie, Bar, Line, Doughnut } from 'react-chartjs-2';
import axios from 'axios';
import './Dashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Filler);

const API_URL = 'http://localhost:5000/api';

function Dashboard({ token }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/identify/stats`);
      if (response.data.success) {
        setStats(response.data.stats);
        setLastRefresh(new Date());
      }
    } catch (err) {
      setError('Failed to load dashboard data. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

 // CSV Export 
  const exportCSV = () => {
    if (!stats) return;
    const edPct = stats.total > 0 ? ((stats.edible / stats.total) * 100).toFixed(1) : 0;
    const poisPct = stats.total > 0 ? ((stats.poisonous / stats.total) * 100).toFixed(1) : 0;
    const susPct = stats.total > 0 ? ((stats.suspicious / stats.total) * 100).toFixed(1) : 0;

    let csv = 'Mushroom Safety System - Dashboard Report\n';
    csv += `Generated,${new Date().toLocaleString()}\n\n`;

    csv += 'SUMMARY STATISTICS\n';
    csv += 'Metric,Value,Percentage\n';
    csv += `Total Identifications,${stats.total},100%\n`;
    csv += `Edible,${stats.edible},${edPct}%\n`;
    csv += `Poisonous,${stats.poisonous},${poisPct}%\n`;
    csv += `Suspicious,${stats.suspicious},${susPct}%\n`;
    csv += `Today,${stats.todayCount},\n`;
    csv += `This Week,${stats.weekCount},\n`;
    csv += `Total Users,${stats.totalUsers},\n\n`;

    csv += 'SPECIES DISTRIBUTION\n';
    csv += 'Rank,Species,Count,Toxicity\n';
    if (stats.speciesDistribution) {
      const poisList = ['amanita', 'cortinarius', 'entoloma', 'poisonous_fungi'];
      const edList = ['agaricus', 'boletus', 'hygrocybe', 'lactarius', 'russula', 'suillus', 'edible_fungi'];
      stats.speciesDistribution.forEach((s, i) => {
        const name = s._id.toLowerCase();
        let tox = 'suspicious';
        if (poisList.includes(name)) tox = 'poisonous';
        if (edList.includes(name)) tox = 'edible';
        csv += `${i + 1},${s._id},${s.count},${tox}\n`;
      });
    }
    csv += '\n';

    csv += 'DAILY COUNTS\n';
    csv += 'Date,Day,Count\n';
    if (stats.dailyCounts) {
      stats.dailyCounts.forEach(d => {
        const dayName = new Date(d._id).toLocaleDateString('en-US', { weekday: 'long' });
        csv += `${d._id},${dayName},${d.count}\n`;
      });
    }
    csv += '\n';

    csv += 'RECENT ACTIVITY\n';
    csv += 'Species,Toxicity,Date\n';
    if (stats.recentActivity) {
      stats.recentActivity.forEach(a => {
        csv += `${a.species},${a.toxicity},${new Date(a.createdAt).toLocaleString()}\n`;
      });
    }
    csv += '\n';

    csv += 'SAFETY ANALYSIS\n';
    csv += 'Metric,Value,Status\n';
    csv += `Edible Rate,${edPct}%,${parseFloat(edPct) > 50 ? 'GOOD' : 'MONITOR'}\n`;
    csv += `Danger Rate,${poisPct}%,${parseFloat(poisPct) > 20 ? 'HIGH RISK' : parseFloat(poisPct) > 10 ? 'MODERATE' : 'LOW'}\n`;
    csv += `Most Common,${stats.speciesDistribution?.[0]?._id || 'N/A'},INFO\n`;

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mushroom-safety-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const timeAgo = (dateString) => {
    const diff = Math.floor((new Date() - new Date(dateString)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  const getToxicityIcon = (toxicity) => {
    switch (toxicity) {
      case 'edible': return '✅';
      case 'poisonous': return '☠️';
      default: return '⚠️';
    }
  };

  const getToxicityBadge = (species) => {
    const poisonous = ['amanita', 'cortinarius', 'entoloma', 'poisonous_fungi'];
    const edible = ['agaricus', 'boletus', 'hygrocybe', 'lactarius', 'russula', 'suillus', 'edible_fungi'];
    const name = species.toLowerCase();
    if (poisonous.includes(name)) return { label: 'poisonous', color: '#ff7675', bg: 'rgba(255, 118, 117, 0.15)' };
    if (edible.includes(name)) return { label: 'edible', color: '#00b894', bg: 'rgba(0, 184, 148, 0.15)' };
    return { label: 'suspicious', color: '#fdcb6e', bg: 'rgba(253, 203, 110, 0.15)' };
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-loading">
          <div className="dashboard-spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="dashboard-error">
          <span>⚠️</span>
          <h2>Could not load dashboard</h2>
          <p>{error}</p>
          <button onClick={fetchStats} className="refresh-btn">🔄 Try Again</button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  // Toxicity Distribution Chart
  const toxicityData = {
    labels: ['Edible', 'Suspicious', 'Poisonous'],
    datasets: [{
      data: [stats.edible, stats.suspicious, stats.poisonous],
      backgroundColor: ['#00b894', '#fdcb6e', '#ff7675'],
      borderColor: ['#00a884', '#f0b93d', '#ff5252'],
      borderWidth: 2,
    }]
  };

  // Weekly Bar Chart
  const getLast7Days = () => {
    const days = [];
    const counts = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      days.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
      const found = stats.dailyCounts?.find(d => d._id === dateStr);
      counts.push(found ? found.count : 0);
    }
    return { days, counts };
  };

  const { days, counts } = getLast7Days();

  const weeklyData = {
    labels: days,
    datasets: [{
      label: 'Identifications',
      data: counts,
      backgroundColor: 'rgba(0, 184, 148, 0.6)',
      borderColor: '#00b894',
      borderWidth: 2,
      borderRadius: 8,
    }]
  };

  // Monthly Trend Line Chart
  const getLast6Months = () => {
    const months = [];
    const monthlyCounts = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthLabel = date.toLocaleDateString('en-US', { month: 'short' });
      months.push(monthLabel);
      const monthStr = date.toISOString().slice(0, 7);
      const count = stats.dailyCounts?.filter(d => d._id.startsWith(monthStr)).reduce((sum, d) => sum + d.count, 0) || 0;
      monthlyCounts.push(count);
    }
    return { months, monthlyCounts };
  };

  const { months, monthlyCounts } = getLast6Months();

  const monthlyTrendData = {
    labels: months,
    datasets: [{
      label: 'Monthly Identifications',
      data: monthlyCounts,
      borderColor: '#74b9ff',
      backgroundColor: 'rgba(116, 185, 255, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#74b9ff',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 5,
    }]
  };

  // Species Data
  const speciesLabels = stats.speciesDistribution?.map(s => s._id) || [];
  const speciesCounts = stats.speciesDistribution?.map(s => s.count) || [];
  const speciesColors = ['#00b894', '#ff7675', '#74b9ff', '#fdcb6e', '#a29bfe', '#fd79a8', '#00cec9', '#fab1a0', '#81ecec', '#636e72'];

  const speciesData = {
    labels: speciesLabels,
    datasets: [{
      data: speciesCounts,
      backgroundColor: speciesColors.slice(0, speciesLabels.length),
      borderWidth: 0,
    }]
  };

  // Top Species Horizontal Bar
  const topSpeciesData = {
    labels: speciesLabels.slice(0, 6),
    datasets: [{
      label: 'Count',
      data: speciesCounts.slice(0, 6),
      backgroundColor: speciesColors.slice(0, 6).map(c => c + '99'),
      borderColor: speciesColors.slice(0, 6),
      borderWidth: 2,
      borderRadius: 6,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: 'rgba(255, 255, 255, 0.8)', font: { size: 12 }, padding: 15 }
      }
    }
  };

  const barOptions = {
    ...chartOptions,
    plugins: { ...chartOptions.plugins, legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: 'rgba(255, 255, 255, 0.7)', stepSize: 1 } },
      x: { grid: { display: false }, ticks: { color: 'rgba(255, 255, 255, 0.7)' } }
    }
  };

  const horizontalBarOptions = {
    ...chartOptions,
    indexAxis: 'y',
    plugins: { ...chartOptions.plugins, legend: { display: false } },
    scales: {
      x: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: 'rgba(255, 255, 255, 0.7)', stepSize: 1 } },
      y: { grid: { display: false }, ticks: { color: 'rgba(255, 255, 255, 0.7)' } }
    }
  };

  const lineOptions = {
    ...chartOptions,
    plugins: { ...chartOptions.plugins, legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: 'rgba(255, 255, 255, 0.7)', stepSize: 1 } },
      x: { grid: { display: false }, ticks: { color: 'rgba(255, 255, 255, 0.7)' } }
    }
  };

  // Calculations
  const ediblePercent = stats.total > 0 ? ((stats.edible / stats.total) * 100).toFixed(1) : 0;
  const poisonousPercent = stats.total > 0 ? ((stats.poisonous / stats.total) * 100).toFixed(1) : 0;
  const suspiciousPercent = stats.total > 0 ? ((stats.suspicious / stats.total) * 100).toFixed(1) : 0;
  const showDangerAlert = stats.total > 0 && parseFloat(poisonousPercent) > 10;
  const top3Species = stats.speciesDistribution?.slice(0, 3) || [];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>📊 Analytics Dashboard</h1>
          <p>Real-time statistics and monitoring
            {lastRefresh && <span className="last-refresh"> • Updated {timeAgo(lastRefresh)}</span>}
          </p>
        </div>
        <div className="header-actions">
          <button className="refresh-btn" onClick={fetchStats}>🔄 Refresh</button>
          <button className="export-btn" onClick={exportCSV}>📥 Export CSV</button>
        </div>
      </div>

      {/* Danger Alert Banner */}
      {showDangerAlert && (
        <div className="danger-alert">
          <span className="danger-alert-icon">⚠️</span>
          <div className="danger-alert-content">
            <h4>Danger Alert: {poisonousPercent}% of identifications are poisonous species</h4>
            <p>{stats.poisonous} poisonous mushrooms detected. All users have been warned with safety alerts.</p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">🍄</div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>Total Identifications</p>
          </div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{stats.edible}</h3>
            <p>Edible ({ediblePercent}%)</p>
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <h3>{stats.suspicious}</h3>
            <p>Suspicious ({suspiciousPercent}%)</p>
          </div>
        </div>
        <div className="stat-card danger">
          <div className="stat-icon">☠️</div>
          <div className="stat-info">
            <h3>{stats.poisonous}</h3>
            <p>Poisonous ({poisonousPercent}%)</p>
          </div>
        </div>
        <div className="stat-card info">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{stats.totalUsers}</h3>
            <p>Total Users</p>
          </div>
        </div>
        <div className="stat-card secondary">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <h3>{stats.todayCount}</h3>
            <p>Today's IDs</p>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>🥧 Toxicity Distribution</h3>
          <div className="chart-container">
            {stats.total > 0 ? (
              <Doughnut data={toxicityData} options={chartOptions} />
            ) : (
              <div className="no-data">No identification data yet</div>
            )}
          </div>
        </div>
        <div className="chart-card">
          <h3>📊 Weekly Identifications</h3>
          <div className="chart-container">
            <Bar data={weeklyData} options={barOptions} />
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>📈 Monthly Trend</h3>
          <div className="chart-container">
            <Line data={monthlyTrendData} options={lineOptions} />
          </div>
        </div>
        <div className="chart-card">
          <h3>🏆 Top Species (Ranking)</h3>
          <div className="chart-container">
            {speciesLabels.length > 0 ? (
              <Bar data={topSpeciesData} options={horizontalBarOptions} />
            ) : (
              <div className="no-data">No species data yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Charts Row 3 */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>🍄 Species Distribution</h3>
          <div className="chart-container">
            {speciesLabels.length > 0 ? (
              <Pie data={speciesData} options={chartOptions} />
            ) : (
              <div className="no-data">No species data yet</div>
            )}
          </div>
        </div>
        <div className="chart-card">
          <h3>🥇 Top 3 Most Identified</h3>
          <div className="top-species-ranking">
            {top3Species.length > 0 ? (
              top3Species.map((species, index) => {
                const badge = getToxicityBadge(species._id);
                const medals = ['🥇', '🥈', '🥉'];
                return (
                  <div key={species._id} className="ranking-item">
                    <span className="ranking-medal">{medals[index]}</span>
                    <div className="ranking-info">
                      <h4>{species._id}</h4>
                      <p>{species.count} identifications</p>
                    </div>
                    <span className="ranking-badge" style={{ color: badge.color, background: badge.bg }}>
                      {badge.label}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="no-data">No species data yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="activity-section">
        <div className="activity-card">
          <h3>🕐 Recent Activity</h3>
          <div className="activity-list">
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity) => (
                <div key={activity._id} className={`activity-item ${activity.toxicity}`}>
                  <span className="activity-icon">{getToxicityIcon(activity.toxicity)}</span>
                  <div className="activity-details">
                    <h4>{activity.species}</h4>
                    <p className={`toxicity-label ${activity.toxicity}`}>{activity.toxicity}</p>
                  </div>
                  <span className="activity-time">{timeAgo(activity.createdAt)}</span>
                </div>
              ))
            ) : (
              <div className="no-data">No recent activity</div>
            )}
          </div>
        </div>

        <div className="quick-stats-card">
          <h3>⚡ Quick Stats</h3>
          <div className="quick-stats-list">
            <div className="quick-stat-item">
              <span className="label">This Week</span>
              <span className="value">{stats.weekCount}</span>
            </div>
            <div className="quick-stat-item">
              <span className="label">Today</span>
              <span className="value">{stats.todayCount}</span>
            </div>
            <div className="quick-stat-item">
              <span className="label">Most Common</span>
              <span className="value">
                {stats.speciesDistribution?.length > 0 ? stats.speciesDistribution[0]._id : 'N/A'}
              </span>
            </div>
            <div className="quick-stat-item">
              <span className="label">Edible Rate</span>
              <span className="value">{ediblePercent}%</span>
            </div>
            <div className="quick-stat-item">
              <span className="label">Danger Rate</span>
              <span className="value danger-text">{poisonousPercent}%</span>
            </div>
            <div className="quick-stat-item">
              <span className="label">Total Species</span>
              <span className="value">{stats.speciesDistribution?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
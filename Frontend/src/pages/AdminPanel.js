import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './AdminPanel.css';

const API_URL = 'http://localhost:5000/api';

function AdminPanel({ user, token, setCurrentPage }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    if (activeTab === 'overview') fetchDashboard();
    else if (activeTab === 'users') fetchUsers();
    else if (activeTab === 'records') fetchRecords();
  }, [activeTab]);

  // Check if user is admin - MUST be AFTER all hooks
  if (!user || user.role !== 'admin') {
    return (
      <div className="admin-panel">
        <div className="access-denied">
          <span>🔒</span>
          <h2>Access Denied</h2>
          <p>You need admin privileges to access this page.</p>
          <button onClick={() => setCurrentPage('home')}>Go Home</button>
        </div>
      </div>
    );
  }

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/admin/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setDashboard(response.data.dashboard);
      }
    } catch (err) {
      console.error('Error fetching admin dashboard:', err);
      setError('Failed to load admin dashboard.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/admin/records`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setRecords(response.data.records);
      }
    } catch (err) {
      console.error('Error fetching records:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Change this user's role to ${newRole}?`)) return;

    try {
      await axios.put(`${API_URL}/admin/users/${userId}/role`, 
        { role: newRole },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to change role');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Delete user "${userName}" and all their records? This cannot be undone.`)) return;

    try {
      await axios.delete(`${API_URL}/admin/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUsers(users.filter(u => u._id !== userId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (!window.confirm('Delete this record?')) return;

    try {
      await axios.delete(`${API_URL}/admin/records/${recordId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setRecords(records.filter(r => r._id !== recordId));
    } catch (err) {
      alert('Failed to delete record');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getRoleCount = (role) => {
    if (!dashboard) return 0;
    const found = dashboard.users.byRole.find(r => r._id === role);
    return found ? found.count : 0;
  };

  const getToxicityCount = (toxicity) => {
    if (!dashboard) return 0;
    const found = dashboard.identifications.toxicity.find(t => t._id === toxicity);
    return found ? found.count : 0;
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <div>
          <h1>🛠️ Admin Panel</h1>
          <p>System management and user administration</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button 
          className={`admin-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Users
        </button>
        <button 
          className={`admin-tab ${activeTab === 'records' ? 'active' : ''}`}
          onClick={() => setActiveTab('records')}
        >
          📋 Records
        </button>
      </div>

      {loading ? (
        <div className="admin-loading">
          <div className="admin-spinner"></div>
          <p>Loading...</p>
        </div>
      ) : (
        <>
          {/* ============ OVERVIEW TAB ============ */}
          {activeTab === 'overview' && dashboard && (
            <>
              <div className="admin-stats">
                <div className="admin-stat-card">
                  <div className="admin-stat-icon">👥</div>
                  <div className="admin-stat-info">
                    <h3>{dashboard.users.total}</h3>
                    <p>Total Users</p>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-icon">🍄</div>
                  <div className="admin-stat-info">
                    <h3>{dashboard.identifications.total}</h3>
                    <p>Total Identifications</p>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-icon">📅</div>
                  <div className="admin-stat-info">
                    <h3>{dashboard.identifications.today}</h3>
                    <p>Today's IDs</p>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-icon">📆</div>
                  <div className="admin-stat-info">
                    <h3>{dashboard.identifications.thisWeek}</h3>
                    <p>This Week</p>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-icon">🛡️</div>
                  <div className="admin-stat-info">
                    <h3>{getRoleCount('admin')}</h3>
                    <p>Admins</p>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-icon">🔬</div>
                  <div className="admin-stat-info">
                    <h3>{getRoleCount('researcher')}</h3>
                    <p>Researchers</p>
                  </div>
                </div>
              </div>

              <div className="admin-grid">
                {/* Recent Users */}
                <div className="admin-table-card">
                  <h3>👥 Recent Users</h3>
                  <div className="admin-table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Joined</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboard.users.recent.map((u) => (
                          <tr key={u._id}>
                            <td>{u.name}</td>
                            <td>{u.email}</td>
                            <td><span className={`role-badge ${u.role}`}>{u.role}</span></td>
                            <td>{formatDate(u.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Top Contributors */}
                <div className="admin-table-card">
                  <h3>🏆 Top Contributors</h3>
                  <div className="contributors-list">
                    {dashboard.topContributors.length > 0 ? (
                      dashboard.topContributors.map((c, index) => (
                        <div key={index} className="contributor-item">
                          <div className="contributor-rank">{index + 1}</div>
                          <div className="contributor-info">
                            <h4>{c.name || 'Unknown User'}</h4>
                            <p>{c.email || ''}</p>
                          </div>
                          <span className="contributor-count">{c.count} IDs</span>
                        </div>
                      ))
                    ) : (
                      <p style={{ color: 'rgba(255,255,255,0.5)', padding: '20px', textAlign: 'center' }}>
                        No contributions yet
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ============ USERS TAB ============ */}
          {activeTab === 'users' && (
            <div className="admin-table-card">
              <h3>👥 All Users ({users.length})</h3>
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id}>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td><span className={`role-badge ${u.role}`}>{u.role}</span></td>
                        <td>{formatDate(u.createdAt)}</td>
                        <td>
                          <div className="action-btns">
                            {u._id !== user.id && (
                              <>
                                <select
                                  className="role-select"
                                  value={u.role}
                                  onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                >
                                  <option value="user">User</option>
                                  <option value="researcher">Researcher</option>
                                  <option value="admin">Admin</option>
                                </select>
                                <button
                                  className="btn-delete-sm"
                                  onClick={() => handleDeleteUser(u._id, u.name)}
                                >
                                  🗑️
                                </button>
                              </>
                            )}
                            {u._id === user.id && (
                              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
                                (You)
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============ RECORDS TAB ============ */}
          {activeTab === 'records' && (
            <div className="admin-table-card">
              <h3>📋 All Identification Records ({records.length})</h3>
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Species</th>
                      <th>Toxicity</th>
                      <th>Confidence</th>
                      <th>User</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r) => (
                      <tr key={r._id}>
                        <td>{r.species}</td>
                        <td>
                          <span className={`table-toxicity ${r.toxicity}`}>
                            {r.toxicity}
                          </span>
                        </td>
                        <td>{(r.confidence * 100).toFixed(1)}%</td>
                        <td>{r.userId?.name || 'Anonymous'}</td>
                        <td>{formatDate(r.createdAt)}</td>
                        <td>
                          <button
                            className="btn-delete-sm"
                            onClick={() => handleDeleteRecord(r._id)}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminPanel;
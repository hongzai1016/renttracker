'use client';

import { useState, useEffect } from 'react';
import { verifyPin, getMembersAndRent, addMember, editMember, deleteMember, updateRentStatus } from '../actions';
import Link from 'next/link';

export default function AdminPage() {
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');

  const [members, setMembers] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const months2026 = [
    { monthYear: '2026-06', display: 'Jun 26' },
    { monthYear: '2026-07', display: 'Jul 26' },
    { monthYear: '2026-08', display: 'Aug 26' },
    { monthYear: '2026-09', display: 'Sep 26' },
    { monthYear: '2026-10', display: 'Oct 26' },
    { monthYear: '2026-11', display: 'Nov 26' },
    { monthYear: '2026-12', display: 'Dec 26' }
  ];
  const months2027 = [
    { monthYear: '2027-01', display: 'Jan 27' },
    { monthYear: '2027-02', display: 'Feb 27' },
    { monthYear: '2027-03', display: 'Mar 27' },
    { monthYear: '2027-04', display: 'Apr 27' },
    { monthYear: '2027-05', display: 'May 27' }
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    const valid = await verifyPin(pin);
    if (valid) {
      setIsAuthenticated(true);
      setError('');
      loadData();
    } else {
      setError('Invalid PIN');
    }
  };

  const loadData = async () => {
    setLoading(true);
    const data = await getMembersAndRent();
    if (data.error) {
      setError(data.error);
    } else {
      setMembers(data.members || []);
      setRecords(data.records || []);
    }
    setLoading(false);
  };

  const handleAddMember = async () => {
    const name = prompt("Enter new member's name:");
    if (name) {
      await addMember(pin, name);
      loadData();
    }
  };

  const handleEditMember = async (id, currentName) => {
    const name = prompt("Edit member's name:", currentName);
    if (name && name !== currentName) {
      await editMember(pin, id, name);
      loadData();
    }
  };

  const handleDeleteMember = async (id) => {
    if (confirm("Are you sure you want to delete this member? All their rent records will be deleted.")) {
      await deleteMember(pin, id);
      loadData();
    }
  };

  const cycleStatus = (currentStatus) => {
    if (currentStatus === 'Paid') return 'Pending';
    if (currentStatus === 'Pending') return 'Overdue';
    return 'Paid'; 
  };

  const handleStatusClick = async (memberId, monthYear, currentStatus) => {
    const newStatus = cycleStatus(currentStatus);
    await updateRentStatus(pin, memberId, monthYear, newStatus, 0);
    loadData();
  };

  if (!isAuthenticated) {
    return (
      <main className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <form onSubmit={handleLogin} className="glass-panel" style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ textAlign: 'center' }}>
            <h2>Admin Access</h2>
            <p className="subtitle" style={{ margin: '0.5rem 0' }}>Enter PIN to continue</p>
          </div>
          <input 
            type="password" 
            className="input" 
            placeholder="PIN" 
            value={pin} 
            onChange={(e) => setPin(e.target.value)} 
            autoFocus 
          />
          {error && <p style={{ color: 'var(--danger)', fontSize: '0.875rem', textAlign: 'center' }}>{error}</p>}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="button" onClick={() => window.location.href='/'} className="btn btn-secondary" style={{ flex: 1, textAlign: 'center' }}>Back</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Login</button>
          </div>
        </form>
      </main>
    );
  }

  const recordMap = {};
  records.forEach(r => {
    if (!recordMap[r.member_id]) recordMap[r.member_id] = {};
    recordMap[r.member_id][r.month_year] = r;
  });

  const renderMonthRow = (member, m) => {
    const rec = recordMap[member.id]?.[m.monthYear];
    const status = rec?.status || 'Pending';
    
    let badgeClass = 'status-pending';
    let icon = '🕒 ';
    if (status === 'Paid') {
      badgeClass = 'status-paid';
      icon = '✓ ';
    }
    if (status === 'Overdue') {
      badgeClass = 'status-overdue';
      icon = '⚠ ';
    }

    return (
      <tr key={m.monthYear}>
        <td style={{ color: 'var(--text-main)', fontWeight: 500 }}>{m.display}</td>
        <td>
          <span 
            className={`status-badge ${badgeClass}`} 
            style={{ cursor: 'pointer', transition: 'transform 0.1s' }}
            onClick={() => handleStatusClick(member.id, m.monthYear, status)}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {icon}{status}
          </span>
        </td>
      </tr>
    );
  };

  return (
    <main className="container">
      <div className="navbar">
        <h1 style={{ margin: 0 }}>Admin Dashboard</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-primary" onClick={handleAddMember}>+ Add Member</button>
        </div>
      </div>
      
      {loading && <div style={{ textAlign: 'center', margin: '2rem 0' }}>Loading data...</div>}

      <div className="members-grid">
        {members.map(member => (
          <div key={member.id} className="glass-panel member-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 className="member-title" style={{ margin: 0 }}>{member.name}</h2>
              <div>
                <button onClick={() => handleEditMember(member.id, member.name)} className="icon-btn" title="Edit">✎</button>
                <button onClick={() => handleDeleteMember(member.id)} className="icon-btn danger-icon" title="Delete">×</button>
              </div>
            </div>
            <table className="vertical-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="year-header">
                  <td colSpan="2">Year 2026</td>
                </tr>
                {months2026.map(m => renderMonthRow(member, m))}
                <tr className="year-header">
                  <td colSpan="2">Year 2027</td>
                </tr>
                {months2027.map(m => renderMonthRow(member, m))}
              </tbody>
            </table>
          </div>
        ))}
        {members.length === 0 && !loading && (
          <div className="glass-panel" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            No members yet. Click "+ Add Member" to get started.
          </div>
        )}
      </div>
    </main>
  );
}

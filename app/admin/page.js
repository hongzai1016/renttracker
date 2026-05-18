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

  // Hardcoded months: June 2026 to May 2027
  const months = [
    { monthYear: '2026-06', display: 'Jun 26' },
    { monthYear: '2026-07', display: 'Jul 26' },
    { monthYear: '2026-08', display: 'Aug 26' },
    { monthYear: '2026-09', display: 'Sep 26' },
    { monthYear: '2026-10', display: 'Oct 26' },
    { monthYear: '2026-11', display: 'Nov 26' },
    { monthYear: '2026-12', display: 'Dec 26' },
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
        <form onSubmit={handleLogin} className="auth-panel">
          <div>
            <h1>Admin Access</h1>
            <p className="subtitle" style={{ margin: '0' }}>Enter PIN to continue</p>
          </div>
          <input 
            type="password" 
            className="input" 
            placeholder="PIN" 
            value={pin} 
            onChange={(e) => setPin(e.target.value)} 
            autoFocus 
          />
          {error && <p style={{ color: 'var(--status-overdue)', fontSize: '0.875rem' }}>{error}</p>}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="button" onClick={() => window.location.href='/'} className="btn btn-secondary" style={{ flex: 1 }}>Back</button>
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

  return (
    <main className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <h1>
          <span className="title-line">Admin</span>
          <span className="title-line">Dashboard</span>
        </h1>
        <button className="btn btn-primary" onClick={handleAddMember}>+ Add</button>
      </div>
      
      {loading && <div style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>Loading data...</div>}

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Member</th>
              {months.map(m => (
                <th key={m.monthYear}>{m.display}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.map(member => (
              <tr key={member.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>{member.name}</span>
                    <button onClick={() => handleEditMember(member.id, member.name)} className="icon-btn" title="Edit">✎</button>
                    <button onClick={() => handleDeleteMember(member.id)} className="icon-btn" style={{ color: 'var(--status-overdue)' }} title="Delete">×</button>
                  </div>
                </td>
                {months.map(m => {
                  const rec = recordMap[member.id]?.[m.monthYear];
                  const status = rec?.status || 'Pending';
                  
                  let statusClass = 'status-pending';
                  if (status === 'Paid') statusClass = 'status-paid';
                  if (status === 'Overdue') statusClass = 'status-overdue';

                  return (
                    <td key={m.monthYear}>
                      <span 
                        className={`status-text ${statusClass}`} 
                        onClick={() => handleStatusClick(member.id, m.monthYear, status)}
                      >
                        {status}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
            {members.length === 0 && !loading && (
              <tr>
                <td colSpan={13} style={{ padding: '2rem 0', color: 'var(--text-muted)' }}>
                  No members yet. Click "+ Add" to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

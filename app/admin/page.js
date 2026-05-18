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

  const now = new Date();
  let startYear = now.getFullYear();
  if (now.getMonth() < 5) startYear--;
  const months = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(startYear, 5 + i, 1);
    months.push({
      monthYear: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      display: d.toLocaleString('en-US', { month: 'short', year: '2-digit' })
    });
  }

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
    const data = await getMembersAndRent();
    if (data.error) {
      setError(data.error);
    } else {
      setMembers(data.members || []);
      setRecords(data.records || []);
    }
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
            <Link href="/" className="btn btn-secondary" style={{ flex: 1, textAlign: 'center' }}>Back</Link>
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
      <div className="navbar">
        <h1 style={{ margin: 0 }}>Admin Dashboard</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-primary" onClick={handleAddMember}>+ Add Member</button>
          <Link href="/" className="btn btn-secondary">Public View</Link>
        </div>
      </div>

      <div className="glass-panel">
        <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
          Click on any status badge to toggle between Pending, Overdue, and Paid. Click on the ✎ or × to edit or delete members.
        </p>
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
                      <span style={{ fontWeight: 600 }}>{member.name}</span>
                      <button onClick={() => handleEditMember(member.id, member.name)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} title="Edit">✎</button>
                      <button onClick={() => handleDeleteMember(member.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }} title="Delete">×</button>
                    </div>
                  </td>
                  {months.map(m => {
                    const rec = recordMap[member.id]?.[m.monthYear];
                    const status = rec?.status || 'Pending';
                    
                    let badgeClass = 'status-pending';
                    if (status === 'Paid') badgeClass = 'status-paid';
                    if (status === 'Overdue') badgeClass = 'status-overdue';

                    return (
                      <td key={m.monthYear}>
                        <span 
                          className={`status-badge ${badgeClass}`} 
                          style={{ cursor: 'pointer', transition: 'transform 0.1s' }}
                          onClick={() => handleStatusClick(member.id, m.monthYear, status)}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          {status}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan={13} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No members yet. Click "+ Add Member" to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

import { getMembersAndRent } from './actions';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const { members, records, error } = await getMembersAndRent();

  // Hardcoded months: June 2026 to May 2027
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

  const recordMap = {};
  if (records) {
    records.forEach(r => {
      if (!recordMap[r.member_id]) recordMap[r.member_id] = {};
      recordMap[r.member_id][r.month_year] = r;
    });
  }

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
          <span className={`status-badge ${badgeClass}`}>
            {icon}{status}
          </span>
        </td>
      </tr>
    );
  };

  return (
    <main className="container">
      <div className="navbar">
        <h1 style={{ margin: 0 }}>RentTrack</h1>
      </div>

      <p className="subtitle">Track rent statuses across members seamlessly.</p>

      {error ? (
        <div className="glass-panel" style={{ borderColor: 'var(--danger)' }}>
          <p style={{ color: 'var(--danger)' }}>{error}</p>
        </div>
      ) : (
        <div className="members-grid">
          {members?.map(member => (
            <div key={member.id} className="glass-panel member-card">
              <h2 className="member-title">{member.name}</h2>
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
          {(!members || members.length === 0) && (
            <div className="glass-panel" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              No members found.
            </div>
          )}
        </div>
      )}
    </main>
  );
}

import { getMembersAndRent } from './actions';
import Link from 'next/link';

// Ensure this page is rendered dynamically so it always has fresh data
export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const { members, records, error } = await getMembersAndRent();

  // Generate 12 months starting from most recent June
  const now = new Date();
  let startYear = now.getFullYear();
  if (now.getMonth() < 5) { // 5 is June
    startYear--;
  }

  const months = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(startYear, 5 + i, 1);
    const monthYear = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const display = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
    months.push({ monthYear, display });
  }

  const recordMap = {};
  if (records) {
    records.forEach(r => {
      if (!recordMap[r.member_id]) recordMap[r.member_id] = {};
      recordMap[r.member_id][r.month_year] = r;
    });
  }

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
        <div className="glass-panel">
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
                {members?.map(member => (
                  <tr key={member.id}>
                    <td style={{ fontWeight: 600 }}>{member.name}</td>
                    {months.map(m => {
                      const rec = recordMap[member.id]?.[m.monthYear];
                      const status = rec?.status || 'Pending';
                      
                      let badgeClass = 'status-pending';
                      if (status === 'Paid') badgeClass = 'status-paid';
                      if (status === 'Overdue') badgeClass = 'status-overdue';

                      return (
                        <td key={m.monthYear}>
                          <span className={`status-badge ${badgeClass}`}>
                            {status}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {(!members || members.length === 0) && (
                  <tr>
                    <td colSpan={13} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No members found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}

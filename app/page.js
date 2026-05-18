import { getMembersAndRent } from './actions';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const { members, records, error } = await getMembersAndRent();

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
                        <td key={m.monthYear}>
                          <span className={`status-badge ${badgeClass}`}>
                            {icon}{status}
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

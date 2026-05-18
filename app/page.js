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
      <h1>
        <span className="title-line">RentTrack</span>
        <span className="title-line">Dashboard</span>
      </h1>

      {error ? (
        <p style={{ color: 'var(--status-overdue)' }}>{error}</p>
      ) : (
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
                  <td>{member.name}</td>
                  {months.map(m => {
                    const rec = recordMap[member.id]?.[m.monthYear];
                    const status = rec?.status || 'Pending';
                    
                    let statusClass = 'status-pending';
                    if (status === 'Paid') statusClass = 'status-paid';
                    if (status === 'Overdue') statusClass = 'status-overdue';

                    return (
                      <td key={m.monthYear}>
                        <span className={`status-text ${statusClass}`}>
                          {status}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
              {(!members || members.length === 0) && (
                <tr>
                  <td colSpan={13} style={{ padding: '2rem 0', color: 'var(--text-muted)' }}>
                    No members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

import DashboardLayout from "@/components/layout/DashboardLayout";

export default function Home() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-950">Industrial Precision Dashboard</h1>
            <p className="mt-1 text-sm text-zinc-500">Manage your quotations and engineering data with pinpoint accuracy.</p>
          </div>
          <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-zinc-950 px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Quotation
          </button>
        </header>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total Revenue', value: '$124,500.00', trend: '+12.5%', color: 'zinc' },
            { label: 'Active Quotations', value: '42', trend: '+4', color: 'zinc' },
            { label: 'Materials Indexed', value: '1,240', trend: '+12', color: 'zinc' },
            { label: 'Drafts', value: '8', trend: '-2', color: 'zinc' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-zinc-200 bg-white p-6 transition-all hover:border-zinc-300">
              <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{stat.label}</div>
              <div className="mt-2 text-2xl font-bold text-zinc-950 tracking-tighter">{stat.value}</div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                {stat.trend} from last month
              </div>
            </div>
          ))}
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 p-6">
            <h2 className="text-lg font-bold text-zinc-950 tracking-tight">Recent Quotations</h2>
          </div>
          <div className="p-0">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Quote ID</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {[
                  { id: 'QT-2026-001', customer: 'Global Motors Corp', status: 'Pending', amount: '$45,200.00' },
                  { id: 'QT-2026-002', customer: 'Precision Engineering Ltd', status: 'Approved', amount: '$12,850.25' },
                  { id: 'QT-2026-003', customer: 'Aerospace Systems', status: 'Draft', amount: '$89,400.00' },
                ].map((row) => (
                  <tr key={row.id} className="group hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-zinc-900">{row.id}</td>
                    <td className="px-6 py-4 text-zinc-600">{row.customer}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                        row.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 
                        row.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-zinc-100 text-zinc-700'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-zinc-900">{row.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

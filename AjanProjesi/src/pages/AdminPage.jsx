import { useEffect, useState } from 'react';

// Simple admin dashboard — reads data directly via Supabase anon client (read-only for admins)
export default function AdminPage() {
  const [stats, setStats] = useState({ users: 0, recipes: 0, premium: 0 });
  const [recentRecipes, setRecentRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use the server API for admin operations in production
    // Here we show a simple stats view
    Promise.all([
      fetch('/api/admin/stats').then(r => r.json()).catch(() => null),
      fetch('/api/recipes?limit=10').then(r => r.json()).catch(() => null),
    ]).then(([statsData, recipesData]) => {
      if (statsData) setStats(statsData);
      if (recipesData?.recipes) setRecentRecipes(recipesData.recipes);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-10 animate-pulse"><div className="h-8 bg-gray-200 rounded w-1/3" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="font-serif text-4xl font-bold text-charcoal mb-8">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: 'Total Users', value: stats.users, icon: '👤' },
          { label: 'Total Recipes', value: stats.recipes, icon: '📖' },
          { label: 'Premium Users', value: stats.premium, icon: '✨' },
        ].map(s => (
          <div key={s.label} className="card p-6 text-center">
            <div className="text-3xl mb-2">{s.icon}</div>
            <div className="text-3xl font-bold text-charcoal">{s.value}</div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Recipes */}
      <div className="card p-6">
        <h2 className="font-serif text-xl font-bold text-charcoal mb-4">Recent Recipes</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="pb-3 font-medium">Title</th>
              <th className="pb-3 font-medium">Author</th>
              <th className="pb-3 font-medium">Visibility</th>
              <th className="pb-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {recentRecipes.map(r => (
              <tr key={r.id} className="border-b border-gray-50 hover:bg-cream transition-colors">
                <td className="py-3 text-charcoal font-medium">{r.title}</td>
                <td className="py-3 text-gray-500">{r.users?.display_name || '—'}</td>
                <td className="py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${r.is_public ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                    {r.is_public ? 'Public' : 'Private'}
                  </span>
                </td>
                <td className="py-3 text-gray-400">{new Date(r.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useBookmarks } from '../hooks/useBookmarks';
import { getUserProfile, getMyProfile, updateMyProfile, cancelSubscription } from '../lib/api';
import RecipeCard from '../components/RecipeCard';
import toast from 'react-hot-toast';

export default function ProfilePage({ isSelf }) {
  const { username } = useParams();
  const { dbUser, refreshDbUser } = useAuth();
  const { bookmarks, fetchBookmarks } = useBookmarks();

  const [profile, setProfile] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('recipes');
  const [editing, setEditing] = useState(false);
  const [bioInput, setBioInput] = useState('');
  const [nameInput, setNameInput] = useState('');

  useEffect(() => {
    if (isSelf) {
      getMyProfile()
        .then(({ data }) => {
          setProfile(data.user);
          setBioInput(data.user.bio || '');
          setNameInput(data.user.display_name || '');
          // Fetch own recipes
          getUserProfile(data.user.display_name).then(r => setRecipes(r.data.recipes || []));
        })
        .finally(() => setLoading(false));
      fetchBookmarks();
    } else if (username) {
      getUserProfile(username)
        .then(({ data }) => { setProfile(data.user); setRecipes(data.recipes || []); })
        .catch(() => setProfile(null))
        .finally(() => setLoading(false));
    }
  }, [isSelf, username]);

  const handleSaveProfile = async () => {
    await updateMyProfile({ display_name: nameInput, bio: bioInput });
    await refreshDbUser();
    toast.success('Profile updated!');
    setEditing(false);
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel your premium subscription?')) return;
    await cancelSubscription();
    await refreshDbUser();
    toast.success('Subscription cancelled. Access continues until end of billing period.');
  };

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-10 animate-pulse"><div className="h-8 bg-gray-200 rounded w-1/3 mb-4" /><div className="h-40 bg-gray-200 rounded-2xl" /></div>;
  if (!profile) return <div className="text-center py-20 text-gray-500">User not found.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Profile Header */}
      <div className="card p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <img
          src={profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.display_name}&size=80&background=C2614F&color=fff`}
          alt={profile.display_name}
          className="w-20 h-20 rounded-full border-4 border-cream"
        />
        <div className="flex-1">
          {editing ? (
            <div className="space-y-2">
              <input value={nameInput} onChange={e => setNameInput(e.target.value)} className="input" placeholder="Display name" />
              <textarea value={bioInput} onChange={e => setBioInput(e.target.value)} className="input resize-none" rows={2} placeholder="Short bio..." />
              <div className="flex gap-2">
                <button onClick={handleSaveProfile} className="btn-primary text-sm">Save</button>
                <button onClick={() => setEditing(false)} className="btn-secondary text-sm">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-serif text-2xl font-bold text-charcoal">{profile.display_name}</h1>
                {profile.is_premium && <span className="text-xs bg-terracotta text-white px-2 py-0.5 rounded-full">Premium ✨</span>}
              </div>
              {profile.bio && <p className="text-gray-500 text-sm mb-2">{profile.bio}</p>}
              <p className="text-xs text-gray-400">Joined {new Date(profile.created_at).toLocaleDateString()}</p>
              {isSelf && (
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setEditing(true)} className="btn-secondary text-xs">Edit Profile</button>
                  {profile.is_premium && <button onClick={handleCancel} className="text-xs text-red-500 hover:underline">Cancel Subscription</button>}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {[
          { id: 'recipes', label: `My Recipes (${recipes.length})` },
          ...(isSelf ? [{ id: 'saved', label: `Saved (${bookmarks.length})` }] : []),
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${tab === t.id ? 'border-terracotta text-terracotta' : 'border-transparent text-gray-500 hover:text-charcoal'}`}
          >{t.label}</button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'recipes' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {recipes.length ? recipes.map(r => <RecipeCard key={r.id} recipe={r} />) : <p className="text-gray-500 col-span-3">No recipes yet.</p>}
        </div>
      )}
      {tab === 'saved' && isSelf && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {bookmarks.length ? bookmarks.map(b => b.recipes && <RecipeCard key={b.recipes.id} recipe={b.recipes} />) : <p className="text-gray-500 col-span-3">No saved recipes yet.</p>}
        </div>
      )}
    </div>
  );
}

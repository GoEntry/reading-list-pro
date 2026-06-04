import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../lib/auth-context';
import { useTheme, type ThemeMode } from '../lib/theme-context';
import { tagsApi } from '../api/tags';
import type { Tag } from '../api/bookmarks';

const PRESET_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899'];

// ─── Profile ────────────────────────────────────────────────────────────────

function ProfileSection() {
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
    window.close();
  }

  return (
    <section>
      <h2 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">
        Profile
      </h2>
      <div className="flex items-center justify-between bg-gray-100 dark:bg-slate-800/50 rounded-lg px-4 py-3">
        <span className="text-[13px] text-gray-700 dark:text-slate-200">{user?.email}</span>
        <button
          onClick={handleLogout}
          className="text-[11px] text-red-500 hover:text-red-400 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors"
        >
          Logout
        </button>
      </div>
    </section>
  );
}

// ─── Theme ───────────────────────────────────────────────────────────────────

function ThemeSection() {
  const { theme, setTheme } = useTheme();
  const modes: { value: ThemeMode; label: string }[] = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' },
  ];

  return (
    <section>
      <h2 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">
        Theme
      </h2>
      <div className="flex gap-1 bg-gray-100 dark:bg-slate-800/50 rounded-lg p-1 w-fit">
        {modes.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={`text-[11px] font-medium px-3 py-1.5 rounded-md transition-colors ${
              theme === value
                ? 'bg-indigo-600 text-white'
                : 'text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}

// ─── Tags ────────────────────────────────────────────────────────────────────

function TagsSection() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const editRef = useRef<HTMLInputElement>(null);
  const committingRef = useRef(false);

  useEffect(() => {
    tagsApi.list()
      .then(setTags)
      .catch(() => setError('Failed to load tags.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (editingId) editRef.current?.focus();
  }, [editingId]);

  async function handleCreate() {
    if (!newName.trim()) return;
    const name = newName.trim();
    const prev = tags;
    const optimistic: Tag = {
      id: `tmp-${Date.now()}`,
      userId: '',
      name,
      color: newColor,
      createdAt: new Date().toISOString(),
    };
    setTags([optimistic, ...prev]);
    setNewName('');
    setError(null);
    try {
      const created = await tagsApi.create(name, newColor);
      setTags(t => t.map(tag => tag.id === optimistic.id ? created : tag));
    } catch {
      setTags(prev);
      setError('Failed to create tag.');
    }
  }

  function startEdit(tag: Tag) {
    setDeletingId(null);
    setEditingId(tag.id);
    setEditingName(tag.name);
  }

  async function commitEdit() {
    if (!editingId || committingRef.current) return;
    committingRef.current = true;
    const name = editingName.trim();
    const tag = tags.find(t => t.id === editingId);
    setEditingId(null);
    if (!tag || !name || tag.name === name) { committingRef.current = false; return; }
    const prev = tags;
    setTags(prev.map(t => t.id === editingId ? { ...t, name } : t));
    setError(null);
    try {
      await tagsApi.update(tag.id, name, tag.color);
    } catch {
      setTags(prev);
      setError('Failed to rename tag.');
    } finally {
      committingRef.current = false;
    }
  }

  async function handleDelete(id: string) {
    const prev = tags;
    setTags(prev.filter(t => t.id !== id));
    setDeletingId(null);
    setError(null);
    try {
      await tagsApi.remove(id);
    } catch {
      setTags(prev);
      setError('Failed to delete tag.');
    }
  }

  return (
    <section>
      <h2 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">
        Tags
      </h2>

      {error && (
        <p className="text-[10px] text-red-400 mb-2">{error}</p>
      )}

      {/* Create form */}
      <div className="flex items-center gap-2 mb-4">
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCreate()}
          placeholder="New tag…"
          className="flex-1 bg-slate-800 border border-slate-700 rounded-md text-[12px] text-slate-200 placeholder-slate-600 px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <div className="flex gap-1">
          {PRESET_COLORS.map(c => (
            <button
              key={c}
              onClick={() => setNewColor(c)}
              title={c}
              style={{ background: c }}
              className={`w-4 h-4 rounded-full flex-shrink-0 transition-transform ${
                newColor === c ? 'scale-125 ring-1 ring-white/40' : ''
              }`}
            />
          ))}
        </div>
        <button
          onClick={handleCreate}
          disabled={!newName.trim()}
          className="text-[11px] bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium px-2.5 py-1.5 rounded-md transition-colors flex-shrink-0"
        >
          Add
        </button>
      </div>

      {/* Tag list */}
      {loading ? (
        <div className="h-6 bg-slate-800 rounded animate-pulse" />
      ) : tags.length === 0 ? (
        <p className="text-[11px] text-slate-600">No tags yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {tags.map(tag => (
            <div key={tag.id}>
              <div className="flex items-center gap-2">
                {editingId === tag.id ? (
                  <input
                    ref={editRef}
                    value={editingName}
                    onChange={e => setEditingName(e.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={e => {
                      if (e.key === 'Enter') commitEdit();
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    className="flex-1 bg-slate-800 border border-indigo-500 rounded text-[11px] text-slate-200 px-2 py-0.5 focus:outline-none"
                  />
                ) : (
                  <button
                    onClick={() => startEdit(tag)}
                    title="Click to rename"
                    style={{
                      background: tag.color + '33',
                      borderColor: tag.color + '66',
                      color: tag.color,
                    }}
                    className="text-[11px] font-medium px-2.5 py-0.5 rounded-full border hover:opacity-80 transition-opacity"
                  >
                    {tag.name}
                  </button>
                )}
                <button
                  onClick={() => setDeletingId(deletingId === tag.id ? null : tag.id)}
                  className="text-slate-600 hover:text-red-400 transition-colors ml-auto flex-shrink-0"
                  title="Delete tag"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>

              {deletingId === tag.id && (
                <div className="flex items-center gap-2 mt-1 pl-1">
                  <span className="text-[10px] text-slate-500">Delete «{tag.name}»?</span>
                  <button
                    onClick={() => handleDelete(tag.id)}
                    className="text-[10px] text-red-400 hover:text-red-300 font-medium transition-colors"
                  >
                    Yes, delete
                  </button>
                  <button
                    onClick={() => setDeletingId(null)}
                    className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Root ────────────────────────────────────────────────────────────────────

export function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-[#0f172a]">
        <svg className="animate-spin w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-[#0f172a]">
        <p className="text-[13px] text-slate-500">Please log in via the extension popup first.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f172a]">
      <div className="max-w-lg mx-auto py-8 px-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center flex-shrink-0">
            <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
          </div>
          <h1 className="text-[15px] font-semibold text-gray-900 dark:text-slate-200">Settings</h1>
        </div>

        <div className="flex flex-col gap-6">
          <ProfileSection />
          <div className="border-t border-slate-200 dark:border-slate-800" />
          <TagsSection />
          <div className="border-t border-slate-200 dark:border-slate-800" />
          <ThemeSection />
        </div>
      </div>
    </div>
  );
}

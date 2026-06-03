import { useState, useEffect, useRef, useCallback } from 'react';
import { extractMetadata } from '../../lib/og-extractor';
import { bookmarksApi, type Bookmark, type Tag } from '../../api/bookmarks';
import { tagsApi } from '../../api/tags';
import { BookmarkCard } from '../components/BookmarkCard';
import { SearchBar } from '../components/SearchBar';
import { TagFilter } from '../components/TagFilter';
import { EmptyState } from '../components/EmptyState';

type ActiveTab = 'all' | 'unread';
const PAGE_SIZE = 20;

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function BookmarksPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('all');
  const [search, setSearch] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [showFilter, setShowFilter] = useState(false);

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 300);
  const lastCardRef = useRef<HTMLDivElement>(null);

  const showUnreadOnly = activeTab === 'unread';

  const loadPage = useCallback(async (pageNum: number, replace: boolean): Promise<void> => {
    try {
      const result = await bookmarksApi.list({
        search: debouncedSearch || undefined,
        tagIds: selectedTagIds.length ? selectedTagIds : undefined,
        isRead: showUnreadOnly ? false : undefined,
        page: pageNum,
        limit: PAGE_SIZE,
      });
      setBookmarks(prev => replace ? result.items : [...prev, ...result.items]);
      setTotal(result.total);
      setHasMore(pageNum * PAGE_SIZE < result.total);
      setPage(pageNum);
      setError(null);
    } catch {
      setError('network');
    }
  }, [debouncedSearch, selectedTagIds, activeTab]);

  // Load tags once on mount
  useEffect(() => {
    tagsApi.list().then(setTags).catch(() => {});
  }, []);

  // Reload bookmarks when loadPage changes (i.e., on mount and when filters change)
  useEffect(() => {
    setLoading(true);
    loadPage(1, true).finally(() => setLoading(false));
  }, [loadPage]);

  // IntersectionObserver — fires loadMore when last card becomes visible
  useEffect(() => {
    if (!lastCardRef.current || !hasMore || loadingMore) return;
    const el = lastCardRef.current;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setLoadingMore(true);
        loadPage(page + 1, false).finally(() => setLoadingMore(false));
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [bookmarks, hasMore, loadingMore, page, loadPage]);

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.url) return;

      let meta: { title: string; description: string; previewImage: string; favicon: string } =
        { title: tab.title ?? '', description: '', previewImage: '', favicon: tab.favIconUrl ?? '' };
      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id! },
          func: extractMetadata,
        });
        if (results?.[0]?.result) {
          meta = results[0].result as typeof meta;
        }
      } catch {
        // System page (chrome://) — executeScript throws; keep the tab-data fallback already assigned
      }

      await bookmarksApi.create({ url: tab.url, ...meta });
      // Refetch page 1 to show the new bookmark at top (no optimistic update)
      await loadPage(1, true);
    } catch {
      setSaveError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await bookmarksApi.remove(id);
      setBookmarks(prev => prev.filter(b => b.id !== id));
      setTotal(prev => prev - 1);
    } catch {
      // If delete fails, leave list unchanged
    }
  }

  function handleTagToggle(tagId: string) {
    setSelectedTagIds(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  }

  function clearFilters() {
    setSearch('');
    setSelectedTagIds([]);
    setActiveTab('all');
  }

  const filterActive = selectedTagIds.length > 0 || showUnreadOnly;
  const showEmpty = !loading && !error && bookmarks.length === 0;
  const emptyVariant = (debouncedSearch || filterActive) ? 'no-results' : 'empty';

  return (
    <div className="flex flex-col h-full bg-[#0f172a] overflow-hidden relative">

      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-800 flex-shrink-0">
        <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center flex-shrink-0">
          <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
          </svg>
        </div>
        <span className="text-[13px] font-semibold text-slate-200 flex-1">Reading List Pro</span>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-[11px] font-medium px-2.5 py-1.5 rounded-md transition-colors"
        >
          {saving ? (
            <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <span>+</span>
          )}
          {saving ? 'Saving…' : 'Save page'}
        </button>
      </div>

      {saveError && (
        <p className="text-[10px] text-red-400 px-3 py-1 bg-red-900/20 border-b border-red-900/40">
          {saveError}
        </p>
      )}

      {/* Search bar */}
      <SearchBar
        value={search}
        onChange={setSearch}
        onFilterClick={() => setShowFilter(f => !f)}
        filterActive={filterActive}
      />

      {/* Filter dropdown — absolutely positioned, overlays card list */}
      {showFilter && (
        <TagFilter
          tags={tags}
          selectedTagIds={selectedTagIds}
          showUnreadOnly={showUnreadOnly}
          onTagToggle={handleTagToggle}
          onUnreadToggle={() => setActiveTab(prev => prev === 'unread' ? 'all' : 'unread')}
          onClose={() => setShowFilter(false)}
        />
      )}

      {/* Tabs */}
      <div className="flex gap-1 px-3 py-1.5 border-b border-slate-800 flex-shrink-0">
        {(['all', 'unread'] as ActiveTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-[10px] px-2.5 py-1 rounded-md capitalize transition-colors ${
              activeTab === tab
                ? 'bg-indigo-600 text-white font-medium'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab === 'all' ? `All${total > 0 ? ` (${total})` : ''}` : 'Unread'}
          </button>
        ))}
        {/* Stats tab — placeholder for Day 5 */}
        <button
          className="text-[10px] px-2.5 py-1 rounded-md text-slate-700 cursor-not-allowed"
          title="Coming in Day 5"
          disabled
        >
          Stats
        </button>
      </div>

      {/* Card list */}
      <div className="flex-1 overflow-y-auto px-2.5 py-2 flex flex-col gap-1">

        {/* Skeleton loading */}
        {loading && [0, 1, 2].map(i => (
          <div key={i} className="h-11 bg-slate-800 rounded-lg animate-pulse" />
        ))}

        {/* Error state */}
        {!loading && error && (
          <EmptyState
            variant="error"
            onRetry={() => {
              setError(null);
              setLoading(true);
              loadPage(1, true).finally(() => setLoading(false));
            }}
          />
        )}

        {/* Empty state */}
        {showEmpty && (
          <EmptyState variant={emptyVariant} onClearFilters={clearFilters} />
        )}

        {/* Bookmark cards */}
        {!loading && !error && bookmarks.map((bookmark, i) => (
          <BookmarkCard
            key={bookmark.id}
            bookmark={bookmark}
            onDelete={handleDelete}
            isLast={i === bookmarks.length - 1}
            lastRef={lastCardRef}
          />
        ))}

        {/* Load-more spinner */}
        {loadingMore && (
          <div className="flex justify-center py-2">
            <svg className="animate-spin w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}

      </div>
    </div>
  );
}

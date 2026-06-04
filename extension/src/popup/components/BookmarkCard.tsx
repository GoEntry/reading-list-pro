import type { Bookmark } from '../../api/bookmarks';

interface Props {
  bookmark: Bookmark;
  onDelete: (id: string) => void;
  onToggleRead: (id: string, isRead: boolean) => void;
  isLast?: boolean;
  lastRef?: React.Ref<HTMLDivElement>;
}

function formatRelativeTime(dateStr: string): string {
  const ms = Date.now() - new Date(dateStr).getTime();
  if (isNaN(ms)) return '';
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
}

function extractDomain(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ''); }
  catch { return url; }
}

export function BookmarkCard({ bookmark, onDelete, onToggleRead, isLast, lastRef }: Props) {
  const isRead = bookmark.isRead;

  function handleCardClick() {
    chrome.tabs.create({ url: bookmark.url });
  }

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    onDelete(bookmark.id);
  }

  return (
    <div
      ref={isLast ? lastRef : undefined}
      role="button"
      tabIndex={0}
      className={`relative rounded-lg px-3 py-2 cursor-pointer border-l-2 transition-colors group ${
        isRead
          ? 'bg-[#161f2e] border-[#1e293b]'
          : 'bg-[#1e293b] border-indigo-500'
      }`}
      onClick={handleCardClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCardClick(); }}
    >
      {/* Row 1: toggle + favicon + title + delete button */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          className={`w-3.5 h-3.5 rounded-full flex-shrink-0 flex items-center justify-center transition-colors ${
            isRead
              ? 'bg-indigo-500 border border-indigo-500'
              : 'border border-slate-600 hover:border-indigo-400'
          }`}
          title={isRead ? 'Mark as unread' : 'Mark as read'}
          onClick={(e) => { e.stopPropagation(); onToggleRead(bookmark.id, !bookmark.isRead); }}
        >
          {isRead && (
            <svg className="w-2 h-2" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 6l3 3 5-5" />
            </svg>
          )}
        </button>
        {bookmark.favicon ? (
          <img
            src={bookmark.favicon}
            className="w-3.5 h-3.5 rounded flex-shrink-0"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            alt=""
          />
        ) : (
          <div className="w-3.5 h-3.5 rounded bg-indigo-500/50 flex-shrink-0" />
        )}
        <span className={`text-[11px] font-medium truncate flex-1 ${isRead ? 'text-slate-500' : 'text-slate-200'}`}>
          {bookmark.title || extractDomain(bookmark.url)}
        </span>
        <button
          onClick={handleDelete}
          className="flex-shrink-0 text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
          title="Delete bookmark"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Row 2: domain + time + read badge */}
      <p className="text-[10px] text-slate-500 mt-0.5 ml-[22px]">
        {extractDomain(bookmark.url)} · {formatRelativeTime(bookmark.createdAt)}
      </p>

      {/* Row 3: tags — only rendered when present */}
      {bookmark.tags.length > 0 && (
        <div className="flex gap-1 flex-wrap mt-1.5 ml-[22px]">
          {bookmark.tags.map(tag => {
            const safeColor = /^#[0-9a-fA-F]{3,8}$/.test(tag.color) ? tag.color : '#6366f1';
            return (
              <span
                key={tag.id}
                className="text-[9px] px-1.5 py-0.5 rounded"
                style={{ backgroundColor: `${safeColor}22`, color: safeColor }}
              >
                {tag.name}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

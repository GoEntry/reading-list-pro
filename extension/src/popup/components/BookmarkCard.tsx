import { useState, useRef, useEffect } from 'react';
import type { Bookmark, Tag } from '../../api/bookmarks';

interface Props {
  bookmark: Bookmark;
  allTags: Tag[];
  onDelete: (id: string) => void;
  onToggleRead: (id: string, isRead: boolean) => void;
  onTagsChange: (id: string, tagIds: string[]) => void;
  onNotesChange: (id: string, notes: string) => void;
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

export function BookmarkCard({ bookmark, allTags, onDelete, onToggleRead, onTagsChange, onNotesChange, isLast, lastRef }: Props) {
  const isRead = bookmark.isRead;
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notesValue, setNotesValue] = useState(bookmark.notes ?? '');
  const pickerRef = useRef<HTMLDivElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);

  // Close picker on outside click
  useEffect(() => {
    if (!showTagPicker) return;
    function handleClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowTagPicker(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showTagPicker]);

  function handleCardClick() {
    chrome.tabs.create({ url: bookmark.url });
  }

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    onDelete(bookmark.id);
  }

  useEffect(() => {
    if (showNotes) notesRef.current?.focus();
  }, [showNotes]);

  function handleTagPickerToggle(e: React.MouseEvent) {
    e.stopPropagation();
    setShowTagPicker(v => !v);
  }

  function handleNotesToggle(e: React.MouseEvent) {
    e.stopPropagation();
    setShowTagPicker(false);
    setShowNotes(v => !v);
  }

  function handleNotesSave() {
    const trimmed = notesValue.trim();
    if (trimmed !== (bookmark.notes ?? '').trim()) {
      onNotesChange(bookmark.id, trimmed);
    }
    setShowNotes(false);
  }

  function handleTagCheck(e: React.MouseEvent, tagId: string) {
    e.stopPropagation();
    const current = bookmark.tags.map(t => t.id);
    const next = current.includes(tagId)
      ? current.filter(id => id !== tagId)
      : [...current, tagId];
    onTagsChange(bookmark.id, next);
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

        {allTags.length > 0 && (
          <button
            onClick={handleTagPickerToggle}
            className={`flex-shrink-0 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 ${
              bookmark.tags.length > 0 ? 'text-indigo-400 opacity-100' : 'text-slate-600 hover:text-indigo-400'
            }`}
            title="Edit tags"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </button>
        )}

        <button
          onClick={handleNotesToggle}
          className={`flex-shrink-0 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 ${
            bookmark.notes ? 'text-amber-400 opacity-100' : 'text-slate-600 hover:text-amber-400'
          }`}
          title={bookmark.notes ? 'Edit note' : 'Add note'}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>

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

      <p className="text-[10px] text-slate-500 mt-0.5 ml-[22px]">
        {extractDomain(bookmark.url)} · {formatRelativeTime(bookmark.createdAt)}
      </p>

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

      {!showNotes && bookmark.notes && (
        <p
          className="text-[10px] text-slate-400 mt-1.5 ml-[22px] line-clamp-2 cursor-text"
          onClick={e => { e.stopPropagation(); setShowNotes(true); }}
        >
          {bookmark.notes}
        </p>
      )}

      {showNotes && (
        <textarea
          ref={notesRef}
          value={notesValue}
          onChange={e => setNotesValue(e.target.value)}
          onBlur={handleNotesSave}
          onClick={e => e.stopPropagation()}
          onKeyDown={e => {
            e.stopPropagation();
            if (e.key === 'Escape') setShowNotes(false);
            if (e.key === 'Enter' && e.metaKey) handleNotesSave();
          }}
          placeholder="Add a note…"
          rows={2}
          className="w-full mt-1.5 ml-[22px] bg-slate-900 border border-slate-600 focus:border-indigo-500 rounded text-[10px] text-slate-300 placeholder-slate-600 px-2 py-1 resize-none focus:outline-none transition-colors"
          style={{ width: 'calc(100% - 22px)' }}
        />
      )}

      {showTagPicker && (
        <div
          ref={pickerRef}
          className="absolute right-2 top-8 z-20 bg-[#1e293b] border border-slate-700 rounded-lg shadow-xl p-1.5 min-w-[130px]"
          onClick={e => e.stopPropagation()}
        >
          <p className="text-[9px] text-slate-500 px-1.5 pb-1">Assign tags</p>
          {allTags.map(tag => {
            const safeColor = /^#[0-9a-fA-F]{3,8}$/.test(tag.color) ? tag.color : '#6366f1';
            const checked = bookmark.tags.some(t => t.id === tag.id);
            return (
              <button
                key={tag.id}
                onClick={(e) => handleTagCheck(e, tag.id)}
                className="flex items-center gap-2 w-full px-1.5 py-1 rounded hover:bg-slate-700 transition-colors"
              >
                <span
                  className={`w-3 h-3 rounded-sm border flex items-center justify-center flex-shrink-0 transition-colors`}
                  style={checked
                    ? { backgroundColor: safeColor, borderColor: safeColor }
                    : { borderColor: '#475569' }
                  }
                >
                  {checked && (
                    <svg className="w-2 h-2" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 6l3 3 5-5" />
                    </svg>
                  )}
                </span>
                <span className="text-[10px] text-slate-300 truncate">{tag.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

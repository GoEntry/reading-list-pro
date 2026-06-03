import type { Tag } from '../../api/bookmarks';

interface Props {
  tags: Tag[];
  selectedTagIds: string[];
  showUnreadOnly: boolean;
  onTagToggle: (tagId: string) => void;
  onUnreadToggle: () => void;
  onClose: () => void;
}

export function TagFilter({
  tags, selectedTagIds, showUnreadOnly,
  onTagToggle, onUnreadToggle, onClose,
}: Props) {
  return (
    <div className="absolute inset-x-0 z-10 bg-[#0f172a] border-b border-slate-700 px-3 py-3 shadow-xl">
      {/* Unread toggle */}
      <label className="flex items-center gap-2 cursor-pointer mb-3">
        <input
          type="checkbox"
          checked={showUnreadOnly}
          onChange={onUnreadToggle}
          className="accent-indigo-500 w-3.5 h-3.5"
        />
        <span className="text-[11px] text-slate-300">Unread only</span>
      </label>

      {/* Tags */}
      {tags.length > 0 && (
        <>
          <p className="text-[10px] uppercase tracking-wide text-slate-500 mb-1.5">Tags</p>
          <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
            {tags.map(tag => {
              const active = selectedTagIds.includes(tag.id);
              const safeColor = /^#[0-9a-fA-F]{3,8}$/.test(tag.color) ? tag.color : '#6366f1';
              return (
                <button
                  key={tag.id}
                  onClick={() => onTagToggle(tag.id)}
                  className="text-[10px] px-2 py-0.5 rounded transition-all"
                  style={{
                    backgroundColor: `${safeColor}${active ? '33' : '15'}`,
                    color: safeColor,
                    border: `1px solid ${active ? safeColor : 'transparent'}`,
                    opacity: active ? 1 : 0.6,
                  }}
                >
                  {tag.name}
                </button>
              );
            })}
          </div>
        </>
      )}

      {tags.length === 0 && (
        <p className="text-[11px] text-slate-500">No tags yet. Create tags from the Options page.</p>
      )}

      <button
        onClick={onClose}
        className="mt-3 text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
      >
        Done
      </button>
    </div>
  );
}

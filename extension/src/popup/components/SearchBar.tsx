interface Props {
  value: string;
  onChange: (value: string) => void;
  onFilterClick: () => void;
  filterActive: boolean;
}

export function SearchBar({ value, onChange, onFilterClick, filterActive }: Props) {
  return (
    <div className="flex gap-2 px-3 py-2 border-b border-slate-800 flex-shrink-0">
      <div className="flex-1 flex items-center gap-2 bg-slate-800 rounded-md px-2.5 py-1.5">
        <svg className="w-3 h-3 text-slate-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Search bookmarks..."
          className="flex-1 bg-transparent text-[11px] text-slate-200 placeholder-slate-500 outline-none"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="text-slate-500 hover:text-slate-300 flex-shrink-0"
            aria-label="Clear search"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      <button
        onClick={onFilterClick}
        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] transition-colors flex-shrink-0 ${
          filterActive
            ? 'bg-indigo-600 text-white'
            : 'bg-slate-800 text-slate-400 hover:text-slate-200'
        }`}
        aria-label="Toggle filters"
        aria-pressed={filterActive}
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filter
      </button>
    </div>
  );
}

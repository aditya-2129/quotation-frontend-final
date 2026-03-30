import React from 'react';

const Header = ({ isCollapsed, title, primaryAction }) => {
  return (
    <header className={`fixed top-0 right-0 z-[100] h-16 border-b border-zinc-200 bg-white/80 backdrop-blur-md transition-all duration-300 ${isCollapsed ? 'left-20' : 'left-64'}`}>
      <div className="flex h-full items-center justify-between px-8">
        <div className="flex items-center">
           <div className="w-64 shrink-0">
              <h1 className="text-xl font-bold text-brand-primary tracking-tight truncate whitespace-nowrap">{title}</h1>
           </div>
        </div>
        
        <div className="flex items-center gap-4">
          {primaryAction && (
             <div className="mr-2">
                {primaryAction}
             </div>
          )}
          <button className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 transition-colors hover:bg-zinc-100">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-primary text-xs font-black text-zinc-950 cursor-pointer shadow-lg shadow-brand-primary/25 ring-2 ring-white transition-all hover:scale-105 active:scale-95">
            AD
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

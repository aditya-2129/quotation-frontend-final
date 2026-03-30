"use client";

import React, { useState } from 'react';

const Header = ({ isCollapsed, title, primaryAction, userProfile, onLogout }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Get initials from user profile name
  const getInitials = () => {
    if (!userProfile?.name) return '??';
    const parts = userProfile.name.split(' ').filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
  };

  const handleLogout = async () => {
    try {
      await onLogout();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <header className={`fixed top-0 right-0 z-[100] flex h-16 items-center justify-between border-b border-zinc-200/80 bg-white/95 backdrop-blur-sm px-8 transition-all duration-300 ${isCollapsed ? 'left-20' : 'left-64'}`}>
      {/* Left: Title */}
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-extrabold tracking-tight text-zinc-900">{title || 'Command Center'}</h1>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {primaryAction && (
          <div>{primaryAction}</div>
        )}

        {/* Notification Bell */}
        <button className="group relative flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 text-zinc-400 transition-all hover:border-zinc-300 hover:text-zinc-600 hover:shadow-sm">
          <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 rounded-xl border border-zinc-200 py-1.5 pl-1.5 pr-3 transition-all hover:border-zinc-300 hover:shadow-sm"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-primary text-[11px] font-black text-zinc-950">
              {getInitials()}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-zinc-900 leading-none">{userProfile?.name || 'User'}</p>
              <p className="text-[10px] text-zinc-400 font-medium capitalize leading-tight mt-0.5">{userProfile?.role || 'user'}</p>
            </div>
            <svg className={`h-3.5 w-3.5 text-zinc-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded-xl border border-zinc-200 bg-white py-2 shadow-xl shadow-zinc-200/50">
                <div className="px-4 py-2.5 border-b border-zinc-100">
                  <p className="text-sm font-bold text-zinc-900">{userProfile?.name}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{userProfile?.email}</p>
                  <span className="mt-1.5 inline-block rounded-full bg-brand-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-primary">
                    {userProfile?.role}
                  </span>
                </div>
                <div className="pt-1">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

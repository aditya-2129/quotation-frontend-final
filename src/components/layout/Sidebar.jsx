import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar = ({ isCollapsed, setIsCollapsed, isHovered, setIsHovered }) => {
  const showFull = !isCollapsed || isHovered;
  const pathname = usePathname();
  
  const menuItems = [
    { name: 'Dashboard', href: '/', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Quotations', href: '/quotations', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { name: 'Customers', href: '/customers', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { name: 'Materials List', href: '/materials', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { name: 'Labor & Processes', href: '/labor-rates', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
    { name: 'Extra Parts List', href: '/bop-library', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  ];

  return (
    <aside 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed left-0 top-0 z-40 h-full border-r border-zinc-200 bg-white shadow-xl transition-all duration-300 ease-in-out ${showFull ? 'w-64' : 'w-20'}`}
    >
      <div className="flex h-16 items-center justify-between border-b border-zinc-100 px-4">
        {showFull && (
          <div className="flex w-full items-center justify-center py-2 h-12">
            <img src="/KE_Logo.png" alt="KRUPA ENGINEERING" className="h-full w-auto object-contain max-w-[160px]" />
          </div>
        )}
        {!showFull && (
          <div className="mx-auto h-10 w-10 overflow-hidden rounded-lg bg-white flex items-center justify-center p-1 border border-zinc-200 shadow-sm">
            <img src="/KE_Logo.png" alt="Logo" className="h-full w-full object-contain" />
          </div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-400 shadow-sm transition-transform hover:text-brand-primary ${isCollapsed ? 'rotate-180' : ''}`}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
      
      <nav className="space-y-1 p-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              title={!showFull ? item.name : ''}
              className={`group flex items-center transition-all duration-300 ${
                isActive 
                  ? 'bg-brand-primary text-zinc-950 shadow-lg shadow-brand-primary/40 font-black' 
                  : 'text-zinc-600 hover:bg-brand-primary/10 hover:text-brand-primary'
              } ${!showFull ? 'justify-center rounded-lg p-2.5' : 'rounded-xl px-4 py-3 text-[13.5px]'}`}
            >
              <svg
                className={`${
                  isActive ? 'text-zinc-950' : 'text-zinc-400 group-hover:text-brand-primary'
                } ${!showFull ? 'h-6 w-6' : 'mr-3 h-5.5 w-5.5'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
              </svg>
              {showFull && <span className="overflow-hidden whitespace-nowrap">{item.name}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;

"use client";

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const DashboardLayout = ({ children, title, primaryAction }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans tracking-tight text-zinc-950 antialiased selection:bg-zinc-950 selection:text-white">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`flex flex-col transition-all duration-300 ${isCollapsed ? 'pl-20' : 'pl-64'}`}>
        <Header isCollapsed={isCollapsed} title={title} primaryAction={primaryAction} />
        <main className="mt-16 min-h-[calc(100vh-64px)] p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

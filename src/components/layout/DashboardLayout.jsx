"use client";

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const DashboardLayout = ({ children, title, primaryAction }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const showFull = !isCollapsed || isHovered;

  return (
    <div className="min-h-screen bg-zinc-50 font-sans tracking-tight text-zinc-950 antialiased selection:bg-brand-primary selection:text-white">
      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
        isHovered={isHovered}
        setIsHovered={setIsHovered}
      />
      <div className={`flex flex-col transition-all duration-300 ${showFull ? 'pl-64' : 'pl-20'}`}>
        <Header isCollapsed={!showFull} title={title} primaryAction={primaryAction} />
        <main className="mt-16 min-h-[calc(100vh-64px)] p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

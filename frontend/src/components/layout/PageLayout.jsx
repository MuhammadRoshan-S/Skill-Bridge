import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const PageLayout = ({ children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="app-shell">
      {/* ── Permanent Desktop Sidebar ─────────────────── */}
      <Sidebar
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* ── Main Body (Topbar + Scrollable Content) ───── */}
      <div className="app-body">
        <Navbar onToggleMobileSidebar={() => setIsMobileOpen(!isMobileOpen)} />

        <main className="app-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default PageLayout;

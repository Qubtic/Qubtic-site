'use client';

import { useState, useEffect } from 'react';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { TechLoader } from '@/components/ui/TechLoader';

export default function PortfolioAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/check');
        if (active) {
          if (res.ok) {
            const data = await res.json();
            setIsAuthenticated(data.authenticated);
          } else {
            setIsAuthenticated(false);
          }
        }
      } catch {
        if (active) {
          setIsAuthenticated(false);
        }
      }
    }
    checkAuth();
    return () => {
      active = false;
    };
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setIsAuthenticated(false);
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F6F0]">
        <TechLoader size="md" text="Verifying Admin Session..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onSuccess={() => setIsAuthenticated(true)} />;
  }

  return <AdminDashboard onLogout={handleLogout} />;
}

import React from 'react';
import { Menu, Calendar, HardHat, RefreshCw } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, onRefresh, isRefreshing }) => {
  const todayStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onMenuClick}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-2.5">
              <div className="bg-sky-600 p-2 rounded-lg shadow-sm">
                <HardHat className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-xl tracking-tight text-white">WageTrack</span>
                <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded font-semibold bg-sky-950 text-sky-400 border border-sky-800">
                  Workforce & Payroll
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 text-xs font-medium text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700">
              <Calendar className="h-3.5 w-3.5 text-sky-400" />
              <span>{todayStr}</span>
            </div>

            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh dashboard data"
              >
                <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`} />
                <span>Sync Data</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

interface ExamPrepHeaderProps {
  examName: string;
  examPath: string;
  currentTab?: string;
  pageTitle?: string;
}

const ExamPrepHeader = ({ examName, examPath, currentTab, pageTitle }: ExamPrepHeaderProps) => {
  return (
    <div className="relative w-full overflow-hidden border-b border-blue-100/50">
      {/* MODERN WHITE-BLUE EFFECT:
          1. Base color is white
          2. Top-right blue radial glow
          3. Very subtle grid pattern overlay 
      */}
      <div className="absolute inset-0 bg-white" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-white to-transparent opacity-70" />
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{ backgroundImage: 'radial-gradient(#1E3A8A 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Navigation Breadcrumb (Minimal) */}
        <nav className="flex items-center gap-2 text-slate-400 text-[11px] font-medium uppercase tracking-wider mb-4">
          <Link to="/" className="hover:text-[#1E3A8A] transition-colors flex items-center gap-1">
            <Home className="w-3 h-3" />
            <span>Home</span>
          </Link>
          <ChevronRight className="w-3 h-3 opacity-50" />
          <Link to="/exam-preparation" className="hover:text-[#1E3A8A] transition-colors">
            Prep
          </Link>
          <ChevronRight className="w-3 h-3 opacity-50" />
          <span className="text-[#1E3A8A] font-semibold">{examName}</span>
        </nav>

        {/* Dynamic Header Content */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight font-['Inter',sans-serif]">
              {pageTitle || examName}
            </h1>
            <p className="text-slate-500 text-sm md:text-base font-medium max-w-2xl">
              Access comprehensive resources, notes, and study materials curated specifically for {examName} aspirants.
            </p>
          </div>
          
          {/* Active Tab Indicator (Optional visual element) */}
          {currentTab && (
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-100">
              <div className="w-2 h-2 rounded-full bg-[#1E3A8A] animate-pulse" />
              <span className="text-[#1E3A8A] text-xs font-bold uppercase tracking-tight">
                Currently Viewing: {currentTab}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamPrepHeader;

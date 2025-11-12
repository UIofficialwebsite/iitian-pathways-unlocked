import React, { useState, useMemo } from 'react';
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Image as ImageIcon } from "lucide-react";

// --- Data based on your wireframe ---

const categories = [
  { id: 'all', name: 'All' },
  { id: 'iitm_bs', name: 'IITM BS' },
  { id: 'jee', name: 'JEE' },
  { id: 'neet', name: 'NEET' },
  { id: 'upsc', name: 'UPSC' },
  { id: 'gate', name: 'GATE' },
  { id: 'cat', name: 'CAT' },
  { id: 'others', name: 'Others' },
];

const subCategories = [
  { id: 'all', name: 'All' },
  { id: 'notes', name: 'Notes' },
  { id: 'pyqs', name: 'PYQs' },
  { id: 'resources', name: 'Resources' },
  { id: 'communities', name: 'Communities' },
  { id: 'study_groups', name: 'Study Groups' },
  { id: 'important_dates', name: 'Important Dates' },
  { id: 'news', name: 'News' },
];

// --- Placeholder content ---
// TODO: Replace this with your actual data from Supabase
const dummyContent = [
  { id: 1, title: 'IITM BS Math Notes', description: 'Week 1-4 notes for Mathematics for Data Science.', category: 'iitm_bs', subCategory: 'notes' },
  { id: 2, title: 'JEE Physics PYQ (2023)', description: 'Previous year questions for JEE Advanced Physics.', category: 'jee', subCategory: 'pyqs' },
  { id: 3, title: 'NEET Biology Community', description: 'Join the official community for NEET aspirants.', category: 'neet', subCategory: 'communities' },
  { id: 4, title: 'UPSC Exam Dates', description: 'Official 2026 calendar for UPSC exams.', category: 'upsc', subCategory: 'important_dates' },
  { id: 5, title: 'IITM BS English Study Group', description: 'Weekly study group for English I.', category: 'iitm_bs', subCategory: 'study_groups' },
  { id: 6, title: 'JEE Chemistry Resources', description: 'Curated list of resources for Organic Chemistry.', category: 'jee', subCategory: 'resources' },
];

// --- Reusable Button Component for Columns ---

interface NavButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors",
      isActive
        ? "bg-blue-100 text-blue-700 font-semibold"
        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
    )}
  >
    {label}
  </button>
);

// --- The Main Explore Component ---

const ExploreTab: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSubCategory, setActiveSubCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter logic based on selected states
  const filteredContent = useMemo(() => {
    return dummyContent.filter(item => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      const matchesSubCategory = activeSubCategory === 'all' || item.subCategory === activeSubCategory;
      const matchesSearch = searchTerm === '' ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesCategory && matchesSubCategory && matchesSearch;
    });
  }, [activeCategory, activeSubCategory, searchTerm]);

  return (
    <div className="flex h-full w-full bg-gray-50/50">
      
      {/* Column 1: Explore Categories */}
      <aside className="w-56 flex-shrink-0 bg-white border-r border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Explore</h2>
        <nav className="space-y-1">
          {categories.map((category) => (
            <NavButton
              key={category.id}
              label={category.name}
              isActive={activeCategory === category.id}
              onClick={() => setActiveCategory(category.id)}
            />
          ))}
        </nav>
      </aside>

      {/* Column 2: Sub-Categories */}
      <aside className="w-56 flex-shrink-0 bg-white border-r border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Sub-Categories</h2>
        <nav className="space-y-1">
          {subCategories.map((subCategory) => (
            <NavButton
              key={subCategory.id}
              label={subCategory.name}
              isActive={activeSubCategory === subCategory.id}
              onClick={() => setActiveSubCategory(subCategory.id)}
            />
          ))}
        </nav>
      </aside>

      {/* Column 3: Content Area */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* Search Bar */}
        <div className="relative mb-6">
          <Input
            placeholder="Search content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>

        {/* Content Cards Grid */}
        <div className="space-y-4">
          {filteredContent.length > 0 ? (
            filteredContent.map((item) => (
              <div key={item.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex items-center space-x-4 hover:shadow-md transition-shadow">
                <div className="flex-shrink-0 bg-gray-100 rounded-md h-16 w-16 flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                  {/* <img src={item.imageUrl} alt={item.title} className="h-16 w-16 rounded-md object-cover" /> */}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-10">
              <h3 className="text-lg font-medium">No Content Found</h3>
              <p className="text-sm">Try adjusting your filters or search term.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ExploreTab;

// src/components/courses/CategoryFilter.tsx
import React from 'react';
import SlidersIcon from "@/components/ui/SliderIcon";

interface Category {
    id: string;
    name: string;
}

interface CategoryFilterProps {
    categories: Category[];
    selectedCategory: string;
    onSelectCategory: (id: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ categories, selectedCategory, onSelectCategory }) => {
    return (
        <div className="flex items-center gap-3">
            <SlidersIcon className="w-5 h-5 text-gray-500" />
            <div className="bg-white rounded-lg shadow-md p-1 inline-flex flex-wrap gap-1">
                {categories.map((category) => (
                    <button
                        key={category.id}
                        onClick={() => onSelectCategory(category.id)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            selectedCategory === category.id
                                ? "bg-royal text-white"
                                : "bg-white text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                        {category.name}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CategoryFilter;

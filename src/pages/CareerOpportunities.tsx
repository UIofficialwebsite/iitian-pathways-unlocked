import { useState, useEffect, useMemo } from "react";
import { useJobsManager } from "@/hooks/useJobsManager"; // Assuming this hook fetches your jobs
import { Job } from "@/types/job";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, Clock, Search } from "lucide-react";
import { useNavigate } from "react-router-dom"; // or 'next/navigation' if using Next.js App Router

export default function CareerOpportunities() {
  const navigate = useNavigate();
  // 1. Fetch jobs from your data source
  const { jobs, loading, error } = useJobsManager(); 

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSubCategory, setSelectedSubCategory] = useState("All");

  // 2. DYNAMICALLY EXTRACT CATEGORIES
  // We use useMemo to recalculate this only when 'jobs' changes
  const availableCategories = useMemo(() => {
    if (!jobs) return [];
    // Extract unique categories from jobs, filter out empty/undefined ones
    const categories = jobs
      .map((job) => job.category)
      .filter((cat): cat is string => !!cat); // Ensure it's a string and truthy
    
    return Array.from(new Set(categories)).sort(); // Remove duplicates and sort
  }, [jobs]);

  // 3. DYNAMICALLY EXTRACT SUB-CATEGORIES
  // Logic: Show sub-categories available for the *selected* category (if any), 
  // or all sub-categories if "All" is selected.
  const availableSubCategories = useMemo(() => {
    if (!jobs) return [];

    let filteredJobs = jobs;

    // Optional: If you want sub-categories to strictly match the selected category
    if (selectedCategory !== "All") {
      filteredJobs = jobs.filter(job => job.category === selectedCategory);
    }

    const subCategories = filteredJobs
      .map((job) => job.subcategory) // Ensure your Job type has 'subcategory' property
      .filter((sub): sub is string => !!sub);

    return Array.from(new Set(subCategories)).sort();
  }, [jobs, selectedCategory]);

  // 4. Filter the displayed jobs based on selection
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === "All" || job.category === selectedCategory;
      
    const matchesSubCategory = 
      selectedSubCategory === "All" || job.subcategory === selectedSubCategory;

    return matchesSearch && matchesCategory && matchesSubCategory;
  });

  if (loading) return <div className="p-8 text-center">Loading opportunities...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error loading jobs</div>;

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Career Opportunities</h1>

      {/* Filters Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search jobs or companies..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Dynamic Category Filter */}
        <Select 
          value={selectedCategory} 
          onValueChange={(val) => {
            setSelectedCategory(val);
            setSelectedSubCategory("All"); // Reset sub-cat when category changes
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Categories</SelectItem>
            {availableCategories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Dynamic Sub-Category Filter */}
        <Select 
          value={selectedSubCategory} 
          onValueChange={setSelectedSubCategory}
          disabled={availableSubCategories.length === 0} // Disable if no sub-cats available
        >
          <SelectTrigger>
            <SelectValue placeholder="Sub-Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Sub-Categories</SelectItem>
            {availableSubCategories.map((sub) => (
              <SelectItem key={sub} value={sub}>
                {sub}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Reset Filters Button */}
        <Button 
          variant="outline" 
          onClick={() => {
            setSearchTerm("");
            setSelectedCategory("All");
            setSelectedSubCategory("All");
          }}
        >
          Reset Filters
        </Button>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-semibold">{job.title}</CardTitle>
                    <p className="text-sm text-gray-500 font-medium">{job.company}</p>
                  </div>
                  {job.type && <Badge variant="secondary">{job.type}</Badge>}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{job.location || "Remote"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    <span>{job.category} {job.subcategory ? `• ${job.subcategory}` : ""}</span>
                  </div>
                  {job.postedDate && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(job.postedDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                <Button className="w-full" onClick={() => navigate(`/career/${job.id}`)}>
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 py-12">
            No jobs found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}

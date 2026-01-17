import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ShoppingCart, Lock, ArrowLeft, Loader2 } from 'lucide-react';
import EnrollButton from '@/components/EnrollButton';
import NavBar from '@/components/NavBar';
import { Course } from '@/components/admin/courses/types';

interface SimpleAddon {
  id: string;
  subject_name: string;
  price: number;
}

const BatchConfiguration = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [addons, setAddons] = useState<SimpleAddon[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Ownership State
  const [ownedAddons, setOwnedAddons] = useState<string[]>([]);
  const [isMainCourseOwned, setIsMainCourseOwned] = useState(false);
  
  // Selection State
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!courseId) return;
      try {
        setLoading(true);
        
        // 1. Fetch Course & Addons
        const [courseRes, addonsRes] = await Promise.all([
          supabase.from('courses').select('*').eq('id', courseId).single(),
          supabase.from('course_addons').select('*').eq('course_id', courseId)
        ]);

        if (courseRes.error) throw courseRes.error;
        setCourse(courseRes.data as Course);
        if (addonsRes.data) setAddons(addonsRes.data as SimpleAddon[]);

        // 2. Check Ownership if logged in
        if (user) {
          const { data: userEnrollments } = await supabase
            .from('enrollments')
            .select('subject_name, status')
            .eq('user_id', user.id)
            .eq('course_id', courseId)
            .or('status.eq.success,status.eq.paid,status.eq.active'); // Ensure we only check valid enrollments

          if (userEnrollments) {
            const owned: string[] = [];
            let mainOwned = false;

            userEnrollments.forEach(enrollment => {
              if (enrollment.subject_name) {
                owned.push(enrollment.subject_name);
              } else {
                mainOwned = true;
              }
            });
            setOwnedAddons(owned);
            setIsMainCourseOwned(mainOwned);
          }
        }
      } catch (error) {
        console.error("Error fetching configuration data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, user]);

  const toggleSubject = (name: string, isOwned: boolean) => {
    if (isOwned) return;
    setSelectedSubjects(prev => 
      prev.includes(name) 
        ? prev.filter(s => s !== name) 
        : [...prev, name]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <NavBar />
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-royal" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 text-center">
         <NavBar />
         <h1 className="text-xl font-bold">Course not found</h1>
         <Button onClick={() => navigate('/courses')} className="mt-4">Back to Courses</Button>
      </div>
    );
  }

  // --- Pricing Logic ---
  const basePrice = isMainCourseOwned ? 0 : (course.discounted_price || course.price);
  
  const addonsTotal = addons.reduce((sum, item) => {
    if (selectedSubjects.includes(item.subject_name) && !ownedAddons.includes(item.subject_name)) {
      return sum + Number(item.price);
    }
    return sum;
  }, 0);

  const finalTotal = basePrice + addonsTotal;

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <NavBar />
      
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/courses/${courseId}`)}
          className="mb-6 -ml-2 text-slate-500 hover:text-royal"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Course Details
        </Button>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <ShoppingCart className="w-6 h-6 text-royal" />
              Configure Your Batch
            </h1>
            <p className="text-slate-600 mt-2">
              {isMainCourseOwned 
                ? "You already own the core batch. Select additional subjects to upgrade." 
                : "Review the mandatory core subjects and select optional add-ons to customize your learning experience."}
            </p>
          </div>

          <div className="p-6 space-y-8">
            {/* 1. Mandatory Section */}
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Included (Mandatory)</h3>
              <div className={`p-4 border rounded-xl flex items-center justify-between transition-colors ${isMainCourseOwned ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200'}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                     <h4 className="font-bold text-lg text-slate-900">{course.title}</h4>
                     {isMainCourseOwned && (
                       <Badge className="bg-green-600 hover:bg-green-700">Purchased</Badge>
                     )}
                  </div>
                  <p className="text-sm text-slate-500">
                    {course.subject ? `Subjects: ${course.subject}` : "All Core Subjects Included"}
                  </p>
                </div>
                <div className="text-right pl-4">
                   {isMainCourseOwned ? (
                     <div className="flex flex-col items-end">
                       <CheckCircle2 className="w-6 h-6 text-green-600 mb-1" />
                       <span className="text-xs font-medium text-green-700">Owned</span>
                     </div>
                   ) : (
                     <span className="text-xl font-bold text-slate-900">₹{course.discounted_price || course.price}</span>
                   )}
                </div>
              </div>
            </div>

            {/* 2. Optional Add-ons Section */}
            {addons.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Optional Add-ons</h3>
                <div className="grid gap-3">
                  {addons.map((addon) => {
                    const isOwned = ownedAddons.includes(addon.subject_name);
                    const isSelected = selectedSubjects.includes(addon.subject_name);

                    return (
                      <div 
                        key={addon.id}
                        onClick={() => toggleSubject(addon.subject_name, isOwned)}
                        className={`
                          relative flex items-center justify-between p-4 border rounded-xl transition-all duration-200
                          ${isOwned 
                            ? 'bg-slate-100 border-slate-200 cursor-not-allowed opacity-80' 
                            : isSelected 
                              ? 'bg-blue-50 border-royal shadow-sm cursor-pointer ring-1 ring-royal' 
                              : 'bg-white border-slate-200 hover:border-slate-300 cursor-pointer hover:shadow-sm'
                          }
                        `}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`
                            w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                            ${isOwned 
                              ? 'bg-slate-300 border-slate-300' 
                              : isSelected 
                                ? 'bg-royal border-royal' 
                                : 'bg-white border-slate-300'
                            }
                          `}>
                            {isOwned ? (
                              <Lock className="w-3 h-3 text-slate-500" />
                            ) : isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div>
                            <p className={`font-semibold ${isOwned ? 'text-slate-500' : 'text-slate-900'}`}>
                              {addon.subject_name}
                            </p>
                            {isOwned && <p className="text-xs text-slate-500">Already included in your plan</p>}
                          </div>
                        </div>
                        
                        <div>
                          {isOwned ? (
                             <Badge variant="outline" className="text-slate-500 border-slate-300">Purchased</Badge>
                          ) : (
                             <span className={`font-bold ${isSelected ? 'text-royal' : 'text-slate-700'}`}>+ ₹{addon.price}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer Summary */}
          <div className="bg-slate-50 p-6 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
               <div>
                 <p className="text-sm text-slate-500 mb-1">Total Payable Amount</p>
                 <div className="flex items-baseline gap-1">
                   <span className="text-3xl font-bold text-royal">₹{finalTotal}</span>
                   {isMainCourseOwned && <span className="text-xs text-green-600 font-medium">(Upgrade Only)</span>}
                 </div>
               </div>

               <div className="w-full sm:w-auto min-w-[200px]">
                 <EnrollButton
                    courseId={course.id}
                    coursePrice={finalTotal}
                    selectedSubjects={selectedSubjects}
                    className="w-full text-lg h-12 bg-royal hover:bg-royal/90 shadow-lg shadow-blue-900/10"
                    disabled={finalTotal === 0 && selectedSubjects.length === 0}
                 >
                    {finalTotal === 0 ? "Select Items to Buy" : "Proceed to Payment"}
                 </EnrollButton>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchConfiguration;

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, Plus } from 'lucide-react';
import { Course } from '@/components/admin/courses/types';
import { SimpleAddon } from '@/components/courses/detail/BatchConfigurationModal';

interface SubjectsSectionProps {
  course: Course;
  addons: SimpleAddon[];
}

const SubjectsSection: React.FC<SubjectsSectionProps> = ({ course, addons }) => {
  // If no subjects text and no addons, don't render anything
  if (!course.subject && addons.length === 0) return null;

  return (
    <div className="space-y-6">
       <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
         <PlayCircle className="h-6 w-6 text-royal" /> Subjects & Add-ons
       </h2>
       
       <Card className="border-slate-200 overflow-hidden">
         <CardContent className="p-0">
           <div className="divide-y divide-slate-100">
             
             {/* 1. MANDATORY SUBJECTS (from course.subject) */}
             {course.subject && (
               <div className="p-4 bg-slate-50/50">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-slate-900">Core Subjects (Included)</h3>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Compulsory</Badge>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {course.subject}
                  </p>
               </div>
             )}

             {/* 2. OPTIONAL ADD-ONS (from addons table) */}
             {addons.map((addon) => (
                 <div key={addon.id} className="p-4 flex gap-4 items-center group hover:bg-slate-50 transition-colors">
                   <div className="flex-shrink-0">
                     <Plus className="w-5 h-5 text-royal" />
                   </div>
                   <div className="flex-grow">
                     <div className="flex justify-between items-start">
                       <h4 className="font-semibold text-slate-900">{addon.subject_name}</h4>
                       <div className="text-right">
                         <span className="font-bold text-slate-900">₹{addon.price}</span>
                         <Badge variant="outline" className="ml-2 text-[10px] text-slate-500">Optional</Badge>
                       </div>
                     </div>
                     <p className="text-xs text-slate-500 mt-1">
                        Click 'Enroll Now' to add this subject to your batch.
                     </p>
                   </div>
                 </div>
             ))}

           </div>
         </CardContent>
       </Card>
    </div>
  );
};

export default SubjectsSection;

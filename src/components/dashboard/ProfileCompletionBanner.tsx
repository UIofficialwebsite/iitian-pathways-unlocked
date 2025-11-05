import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ProfileCompletionBannerProps {
  profile: any;
  onEditProfile: () => void;
}

const ProfileCompletionBanner: React.FC<ProfileCompletionBannerProps> = ({ 
  profile, 
  onEditProfile 
}) => {
  if (!profile) {
    return (
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Complete Your Profile
              </h3>
              <p className="text-gray-700 mb-4">
                To get personalized course recommendations and content, please complete your profile.
              </p>
              <Button onClick={onEditProfile} className="bg-orange-600 hover:bg-orange-700">
                Set Up Profile
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const requiredFields = [
    { key: 'full_name', label: 'Full Name', value: profile.full_name },
    { key: 'program_type', label: 'Focus Area', value: profile.program_type },
    { key: 'email', label: 'Email', value: profile.email },
  ];

  // Additional conditional fields based on program type
  if (profile.program_type === 'IITM_BS') {
    requiredFields.push(
      { key: 'level', label: 'Level', value: profile.level },
      { key: 'branch', label: 'Branch', value: profile.branch }
    );
  } else if (profile.program_type === 'COMPETITIVE_EXAM') {
    requiredFields.push(
      { key: 'exam_type', label: 'Exam Type', value: profile.exam_type },
      { key: 'student_status', label: 'Student Status', value: profile.student_status }
    );
  }

  const completedFields = requiredFields.filter(field => field.value && field.value.trim() !== '');
  const missingFields = requiredFields.filter(field => !field.value || field.value.trim() === '');
  const completionPercentage = Math.round((completedFields.length / requiredFields.length) * 100);

  // Only show banner if profile is incomplete
  if (completionPercentage === 100) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {completionPercentage < 50 ? (
            <AlertCircle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-1" />
          ) : (
            <CheckCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
          )}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Profile {completionPercentage}% Complete
              </h3>
              <span className="text-sm font-medium text-gray-600">
                {completedFields.length}/{requiredFields.length} fields
              </span>
            </div>
            
            <Progress value={completionPercentage} className="mb-3 h-2" />
            
            <p className="text-gray-700 mb-3">
              Complete your profile to get better course recommendations and personalized content.
            </p>
            
            {missingFields.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-800 mb-2">Missing fields:</p>
                <div className="flex flex-wrap gap-2">
                  {missingFields.map(field => (
                    <span 
                      key={field.key}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-white border border-gray-300 text-gray-700"
                    >
                      {field.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <Button 
              onClick={onEditProfile} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              Complete Profile
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCompletionBanner;

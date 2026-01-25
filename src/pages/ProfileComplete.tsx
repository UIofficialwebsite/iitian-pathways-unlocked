import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useProfileForm } from '@/hooks/useProfileForm';
import ProfileForm from '@/components/profile/ProfileForm';
import { usePageSEO, SEO_TITLES } from "@/utils/seoManager";

const ProfileComplete = () => {
  usePageSEO(SEO_TITLES.PROFILE_COMPLETE, "/profile/complete");
  const formProps = useProfileForm();

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 pt-24 pb-24">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Complete Your Profile</CardTitle>
            <CardDescription>Please provide your details to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm {...formProps} />
          </CardContent>
        </Card>
      </div>
      <Footer />
    </>
  );
};

export default ProfileComplete;

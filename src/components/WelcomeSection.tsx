// Remove the imports for Card and CardContent
// import { Card, CardContent } from "@/components/ui/card"; 
import { useAuth } from "@/hooks/useAuth";

const WelcomeSection = () => {
  const { user } = useAuth();

  return (
    // Replaced <Card> with a <div>.
    // Removed all card-specific classes like 'shadow-lg', 'bg-white/90', 'backdrop-blur-sm', and 'max-w-4xl'.
    // The 'w-full' and 'mx-auto' keeps it centered and full-width in its container.
    // The 'p-6' provides the necessary internal padding for the content.
    <div className="w-full mx-auto p-6">
      {/* The content that was inside CardContent */}
      {/* <CardContent className="p-6"> is effectively replaced by "p-6" on the main div */}
        <h1 className="text-3xl font-bold mb-4 text-gray-800">
          Welcome to IITian Pathways Unlocked, {user?.user_metadata.full_name || "Trailblazer"}!
        </h1>
        <p className="text-lg text-gray-600">
          Your journey to success in JEE, NEET, and the IIT Madras BS Degree is just beginning. Dive into our curated resources, courses, and tools.
        </p>
    </div>
  );
};

export default WelcomeSection;

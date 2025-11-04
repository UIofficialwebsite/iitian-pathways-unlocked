import React from "react";
// import NavBar from "@/components/NavBar"; // Removed
// import Footer from "@/components/Footer"; // Removed
import ModernDashboard from "@/components/dashboard/ModernDashboard";
import OptimizedAuthWrapper from "@/components/OptimizedAuthWrapper";

const Dashboard = () => {
  return (
    <>
      {/* <NavBar /> Removed */}
      {/* <div className="pt-20"> Removed pt-20 */}
      <div>
        <OptimizedAuthWrapper>
          <ModernDashboard />
        </OptimizedAuthWrapper>
      </div>
      {/* <Footer /> Removed */}
    </>
  );
};

export default Dashboard;

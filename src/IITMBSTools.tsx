import React from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import IITMToolsTab from "@/components/iitm/IITMToolsTab";

const IITMBSTools = () => {
  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">IITM BS Tools</h1>
            <p className="text-xl text-gray-600">Calculators and predictors for IITM BS students</p>
          </div>
          <IITMToolsTab />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default IITMBSTools;

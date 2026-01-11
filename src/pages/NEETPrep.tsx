
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import NEETHeader from "@/components/neet/NEETHeader";
import NEETTabs from "@/components/neet/NEETTabs";
import { getTabFromUrl } from "@/utils/urlHelpers";

const NEETPrep = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  return (
    <>
      <NavBar />
      <main className="pt-20">
        <NEETHeader />
        <NEETTabs navigate={navigate} location={location} />
      </main>
      <Footer />
    </>
  );
};

export default NEETPrep;

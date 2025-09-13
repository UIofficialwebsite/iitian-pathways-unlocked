
import React from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import EmailPopup from "@/components/EmailPopup";
import NEETHeader from "@/components/neet/NEETHeader";
import NEETTabs from "@/components/neet/NEETTabs";

const NEETPrep = () => {
  return (
    <>
      <NavBar />
      <main className="pt-20">
        <NEETHeader />
        <NEETTabs />
      </main>
      <Footer />
      <EmailPopup />
    </>
  );
};

export default NEETPrep;

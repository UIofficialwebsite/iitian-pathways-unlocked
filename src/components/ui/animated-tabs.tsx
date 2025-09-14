"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface Tab {
  id: string;
  label: string;
}

interface AnimatedTabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
}

export function AnimatedTabs({ 
  tabs, 
  defaultTab,
  onChange 
}: AnimatedTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0].id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  return (
    <div className="flex justify-center">
      <div className="flex space-x-1 p-1 bg-muted rounded-[--radius]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`
              relative rounded-[--radius] px-4 py-2 text-sm font-medium
              text-foreground outline-ring transition
              focus-visible:outline-2
              ${activeTab === tab.id ? "" : "hover:text-foreground/60"}
            `}
            style={{
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {activeTab === tab.id && (
              <motion.span
                layoutId="bubble"
                className="absolute inset-0 z-10 bg-background shadow-sm"
                style={{ borderRadius: "var(--radius)" }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-20">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
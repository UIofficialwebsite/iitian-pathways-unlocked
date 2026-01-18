import React from 'react';

// Simple addon type used across the app - matches course_addons table
export interface SimpleAddon {
  id: string;
  course_id?: string;
  subject_name: string;
  price: number;
  created_at?: string;
}

// This is a placeholder - the actual batch configuration is handled by BatchConfiguration.tsx page
const BatchConfigurationModal: React.FC = () => {
  return null;
};

export default BatchConfigurationModal;

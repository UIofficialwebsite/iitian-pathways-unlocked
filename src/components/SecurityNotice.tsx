import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle } from "lucide-react";

interface SecurityNoticeProps {
  level: 'info' | 'warning' | 'error';
  title: string;
  message: string;
  showIcon?: boolean;
}

export const SecurityNotice: React.FC<SecurityNoticeProps> = ({ 
  level, 
  title, 
  message, 
  showIcon = true 
}) => {
  const getIcon = () => {
    switch (level) {
      case 'info':
        return <Shield className="h-4 w-4" />;
      case 'warning':
      case 'error':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getVariant = () => {
    switch (level) {
      case 'error':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <Alert variant={getVariant()} className="mb-4">
      {showIcon && getIcon()}
      <AlertDescription>
        <strong>{title}:</strong> {message}
      </AlertDescription>
    </Alert>
  );
};

export default SecurityNotice;
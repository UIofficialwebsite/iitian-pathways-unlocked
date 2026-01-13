import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share, Check } from 'lucide-react'; 
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ShareButtonProps {
  url: string;
  title: string;
  description?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showText?: boolean;
  forceTextOnMobile?: boolean; 
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  url,
  title,
  description,
  variant = 'outline',
  size = 'sm',
  className,
  showText = false,
  forceTextOnMobile = false
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      if (navigator.share) {
        await navigator.share({ title, text: description || `Check out: ${title}`, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success('Link copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) { 
      console.error('Error sharing:', error); 
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleShare}
      className={cn("rounded-md border-gray-200 hover:border-black transition-all h-9 px-3", className)}
    >
      {copied ? <Check className="h-4 w-4" /> : <Share className="h-4 w-4" />}
      {showText && (
        <span className="ml-2 font-semibold">
          {copied ? 'Copied' : 'Share'}
        </span>
      )}
    </Button>
  );
};

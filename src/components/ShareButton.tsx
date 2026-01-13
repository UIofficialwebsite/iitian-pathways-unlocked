import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share, Check } from 'lucide-react'; // Changed Share2 to Share for professional style
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
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  url,
  title,
  description,
  variant = 'outline',
  size = 'sm',
  className,
  showText = false
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text: description || `Check out: ${title}`,
          url,
        });
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
      // Removed rounded-full, used rounded-md for rectangular corners
      className={cn("rounded-md border-gray-200 hover:border-black transition-all", className)}
      title="Share"
    >
      {copied ? <Check className="h-4 w-4" /> : <Share className="h-4 w-4" />}
      {showText && (
        // Text is hidden on mobile, shown on small screens and up
        <span className="hidden sm:inline-block ml-2">{copied ? 'Copied' : 'Share'}</span>
      )}
    </Button>
  );
};

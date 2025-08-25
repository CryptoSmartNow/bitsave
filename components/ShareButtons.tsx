'use client';

import React, { useState } from 'react';
import { Share2, Copy, Check, Linkedin } from 'lucide-react';

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
}

// X (formerly Twitter) icon component
const XIcon = ({ className = '' }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export default function ShareButtons({ 
  url, 
  title, 
  description = '', 
  className = '' 
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? window.location.origin + url : url;
  const encodedUrl = encodeURIComponent(shareUrl);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareOnX = () => {
    const text = `${title} ${shareUrl}`;
    const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(xUrl, '_blank', 'noopener,noreferrer');
  };

  const shareOnLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    window.open(linkedInUrl, '_blank', 'noopener,noreferrer');
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: shareUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <span className="text-sm font-medium text-gray-700 flex items-center">
        <Share2 className="w-4 h-4 mr-2" />
        Share:
      </span>
      
      <div className="flex items-center space-x-2">
        {/* Copy Link Button */}
        <button
          onClick={copyToClipboard}
          className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors group"
          title="Copy link"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <Copy className="w-4 h-4 group-hover:text-gray-900" />
          )}
          <span className="ml-2 text-sm">
            {copied ? 'Copied!' : 'Copy'}
          </span>
        </button>

        {/* X (Twitter) Button - Greyed Out */}
        <button
          onClick={shareOnX}
          className="flex items-center px-3 py-2 bg-gray-300 hover:bg-gray-400 text-gray-600 hover:text-gray-700 rounded-lg transition-colors opacity-60 hover:opacity-80"
          title="Share on X"
        >
          <XIcon className="w-4 h-4" />
          <span className="ml-2 text-sm">X</span>
        </button>

        {/* LinkedIn Button - Greyed Out */}
        <button
          onClick={shareOnLinkedIn}
          className="flex items-center px-3 py-2 bg-gray-300 hover:bg-gray-400 text-gray-600 hover:text-gray-700 rounded-lg transition-colors opacity-60 hover:opacity-80"
          title="Share on LinkedIn"
        >
          <Linkedin className="w-4 h-4" />
          <span className="ml-2 text-sm">LinkedIn</span>
        </button>

        {/* Native Share (Mobile) */}
        {typeof window !== 'undefined' && 'share' in navigator && (
          <button
            onClick={shareNative}
            className="flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors md:hidden"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
            <span className="ml-2 text-sm">Share</span>
          </button>
        )}
      </div>
    </div>
  );
}
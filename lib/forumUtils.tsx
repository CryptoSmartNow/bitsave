import React from 'react';
import { SparklesIcon } from 'hugeicons-react';

export const formatForumDate = (dateStr: string) => {
  if (!dateStr) return 'Recently';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Recently';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;

  if (diffDays === 0 && now.getDate() === date.getDate()) {
    return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (yesterday.getDate() === date.getDate() && yesterday.getMonth() === date.getMonth() && yesterday.getFullYear() === date.getFullYear()) {
    return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

export const isSavvyBotUser = (walletAddress?: string, savvyName?: string | null) => {
  if (!walletAddress && !savvyName) return false;
  const isBotAddr = walletAddress ? walletAddress.toLowerCase().includes('savvybot') : false;
  const isBotName = savvyName ? savvyName.toLowerCase() === 'savvybot' : false;
  return isBotAddr || isBotName;
};

export const renderFormattedContent = (content: string) => {
  if (!content) return null;

  // Regex to match markdown links: [text](url) and mentions @username
  const tokenRegex = /(\[[^\]]+\]\([^\)]+\)|@[a-zA-Z0-9_\.]+)/g;
  const parts = content.split(tokenRegex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Match markdown link: [text](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^\)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={index}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#81D7B4] hover:underline font-bold break-all"
        >
          {linkMatch[1]}
        </a>
      );
    }

    // Match mention: @username
    if (part.startsWith('@')) {
      const isBot = part.toLowerCase() === '@savvybot' || part.toLowerCase() === '@savvy';
      return (
        <span
          key={index}
          className={`font-bold px-1.5 py-0.5 rounded-md inline-flex items-center gap-1 ${
            isBot 
              ? 'bg-[#81D7B4]/20 text-[#81D7B4]' 
              : 'bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200'
          }`}
        >
          {isBot && <SparklesIcon className="w-3 h-3 text-[#81D7B4]" />}
          <span>{part}</span>
        </span>
      );
    }

    return <span key={index}>{part}</span>;
  });
};

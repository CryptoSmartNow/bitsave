"use client"
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

// Utility function to generate YouTube thumbnail URL with fallback
const getYouTubeThumbnail = (videoId: string, quality: 'maxresdefault' | 'hqdefault' | 'mqdefault' | 'sddefault' = 'maxresdefault') => {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
};

// Function to fetch video title from YouTube Embed API
const fetchVideoTitle = async (videoId: string): Promise<string> => {
  try {
    const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    if (response.ok) {
      const data = await response.json();
      return data.title || 'Video Title';
    }
  } catch (error) {
    console.error('Error fetching video title:', error);
  }
  return 'Video Title'; // Fallback title
};

// Video data will be passed as props
type Video = {
  id: string;
  title: string;
  thumbnail?: string;
  url?: string;
  creator?: string;
  embedUrl?: string;
}

const VideoCard = ({ video, index }: { video: Video; index: number }) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [showPlayer, setShowPlayer] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [thumbnailError, setThumbnailError] = useState(false)
  const [actualTitle, setActualTitle] = useState(video.title)
  const [titleLoading, setTitleLoading] = useState(true)
  const cardRef = useRef<HTMLDivElement>(null)
  
  // Generate thumbnail URL with fallback
  const thumbnailUrl = video.thumbnail || getYouTubeThumbnail(video.id)
  const fallbackThumbnailUrl = getYouTubeThumbnail(video.id, 'hqdefault')

  // Fetch actual video title
  useEffect(() => {
    const getTitle = async () => {
      try {
        const title = await fetchVideoTitle(video.id);
        setActualTitle(title);
      } catch (error) {
        console.error('Failed to fetch video title:', error);
      } finally {
        setTitleLoading(false);
      }
    };
    
    getTitle();
  }, [video.id]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting)
      },
      { threshold: 0.1 }
    )

    const currentElement = cardRef.current
    if (currentElement) {
      observer.observe(currentElement)
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement)
      }
      observer.disconnect()
    }
  }, [])

  const handlePlayClick = () => {
    setShowPlayer(true)
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="w-full relative bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] overflow-hidden group transition-all duration-300 hover:shadow-[0_8px_24px_-4px_rgba(129,215,180,0.2)] hover:border-[#81D7B4]/30 flex flex-col h-full"
    >
      <div className="relative z-10">
        {showPlayer ? (
          <div className="aspect-video rounded-t-2xl overflow-hidden">
            <iframe
              src={video.embedUrl}
              title={actualTitle}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
              onLoad={() => setIsLoaded(true)}
            />
          </div>
        ) : (
          <div className="relative aspect-video rounded-t-2xl overflow-hidden group/thumbnail">
            <div className="absolute inset-0 bg-black/0 z-10 transition-colors duration-300 group-hover:bg-black/10"></div>
            
            <Image
              src={thumbnailError ? fallbackThumbnailUrl : thumbnailUrl}
              alt={actualTitle}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              onLoad={() => setIsLoaded(true)}
              onError={() => {
                if (thumbnailError) {
                  setIsLoaded(true);
                } else {
                  setThumbnailError(true);
                }
              }}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
            
            <motion.button
              onClick={handlePlayClick}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="absolute inset-0 flex items-center justify-center z-30 group/play opacity-90 group-hover:opacity-100 transition-opacity"
            >
              <div className="w-14 h-14 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center transition-all duration-300 shadow-lg group-hover:scale-105">
                <svg className="w-6 h-6 text-[#81D7B4] ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </motion.button>
            
            {!isLoaded && (
              <div className="absolute inset-0 bg-gray-50 flex items-center justify-center z-20">
                <div className="w-8 h-8 border-2 border-[#81D7B4] border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        )}

        <div className="p-5 flex flex-col flex-grow relative">
          <div className="flex items-center mb-2">
            <span className="text-[10px] font-bold text-[#81D7B4] uppercase tracking-wider bg-[#81D7B4]/10 px-2 py-1 rounded-md">
              {video.creator || 'Savvy Finance'}
            </span>
          </div>
          
          <h3 className="text-base font-bold text-gray-900 mb-4 line-clamp-2 leading-tight flex-grow group-hover:text-[#2D5A4A] transition-colors duration-300">
            {titleLoading ? (
              <div className="space-y-2">
                <div className="h-4 bg-gray-100 rounded animate-pulse w-full"></div>
                <div className="h-4 bg-gray-100 rounded w-2/3 animate-pulse"></div>
              </div>
            ) : (
              actualTitle
            )}
          </h3>
          
          <motion.button
            onClick={() => window.open(video.url, '_blank')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-white border border-gray-100 text-gray-600 hover:text-[#81D7B4] hover:border-[#81D7B4]/50 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 mt-auto group/btn shadow-sm hover:shadow-md"
          >
            <svg className="w-4 h-4 text-gray-400 group-hover:text-[#81D7B4] transition-colors" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            <span>Watch on YouTube</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

const SavvyFinanceVideos = ({ videos }: { videos: Video[] }) => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {videos.map((video, index) => (
          <VideoCard key={video.id} video={video} index={index} />
        ))}
      </div>
      
      <div className="flex justify-center">
        <a
          href="https://www.youtube.com/@bitsaveprotocol"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#81D7B4] transition-colors"
        >
          <span>View More on YouTube</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>
      </div>
    </div>
  )
}

export default SavvyFinanceVideos

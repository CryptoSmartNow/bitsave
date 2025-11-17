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
      className="flex-shrink-0 w-[320px] sm:w-[380px] md:w-[420px] lg:w-[450px] relative bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden group transition-all duration-300"
    >
      {/* Noise texture overlay */}
  {/* Noise background removed per redesign spec */}
      
      {/* Decorative elements */}
            {/* Decorative elements removed for performance */}
      
      <div className="relative z-10">
        {showPlayer ? (
          <div className="aspect-video rounded-t-3xl overflow-hidden">
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
          <div className="relative aspect-video rounded-t-3xl overflow-hidden group/thumbnail">
            {/* Enhanced thumbnail with glassmorphism overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover/thumbnail:opacity-100 transition-opacity duration-300 z-20"></div>
            
            <Image
              src={thumbnailError ? fallbackThumbnailUrl : thumbnailUrl}
              alt={actualTitle}
              fill
              className="object-cover group-hover/thumbnail:scale-105 transition-transform duration-700"
              onLoad={() => setIsLoaded(true)}
              onError={() => setThumbnailError(true)}
              sizes="(max-width: 640px) 320px, (max-width: 768px) 380px, (max-width: 1024px) 420px, 450px"
            />
            
            {/* Enhanced play button */}
            <motion.button
              onClick={handlePlayClick}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="absolute inset-0 flex items-center justify-center z-30 group/play"
            >
              <div className="w-16 h-16 bg-white rounded-full border border-gray-200 shadow-sm flex items-center justify-center transition-all duration-300">
                <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </motion.button>
            
            {/* Loading indicator */}
            {!isLoaded && (
              <div className="absolute inset-0 bg-gray-200/50 backdrop-blur-sm flex items-center justify-center z-20">
                <div className="w-8 h-8 border-2 border-[#81D7B4] border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        )}

        {/* Enhanced content section */}
        <div className="p-6 relative">
          {/* Background gradient removed for performance */}
          
          <div className="relative z-10">
            {/* Creator badge */}
            <div className="flex items-center mb-3">
              <div className="w-2 h-2 bg-[#81D7B4] rounded-full mr-2 animate-pulse"></div>
              <span className="text-xs font-medium text-gray-600/80 tracking-wide uppercase">
                {video.creator || 'Savvy Finance'}
              </span>
            </div>
            
            {/* Title */}
            <h3 className="text-lg font-semibold text-gray-900 mb-4 line-clamp-2 leading-tight tracking-tight">
              {titleLoading ? (
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300/50 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-300/50 rounded w-3/4 animate-pulse"></div>
                </div>
              ) : (
                actualTitle
              )}
            </h3>
            
            {/* Enhanced watch button */}
            <motion.button
              onClick={() => window.open(video.url, '_blank')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-[#81D7B4] hover:bg-[#76cbaa] text-white py-3 px-4 rounded-xl font-medium text-sm shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              <span>Watch Now</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const SavvyFinanceVideos = ({ videos }: { videos: Video[] }) => {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return

    let animationFrameId: number
    const scroll = () => {
      if (!isHovered) {
        scroller.scrollLeft += 0.3
        if (scroller.scrollLeft >= scroller.scrollWidth / 2) {
          scroller.scrollLeft = 0
        }
      }
      animationFrameId = requestAnimationFrame(scroll)
    }

    animationFrameId = requestAnimationFrame(scroll)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [isHovered])

  const duplicatedVideos = [...videos, ...videos]

  return (
    <div className="relative">
      {/* Simplified container for performance */}
      <div className="relative bg-white rounded-3xl border border-gray-200 shadow-sm p-6 overflow-visible">
        {/* Noise texture overlay */}
  {/* Noise background removed per redesign spec */}
        
        {/* Decorative elements removed for performance */}
        
        <div className="relative z-10">
          {/* Enhanced scrolling container */}
          <div
            ref={scrollerRef}
            className="relative w-full overflow-x-auto scrollbar-hide [mask-image:_linear_gradient(to_right,transparent_0,_black_128px,_black_calc(100%-200px),transparent_100%)]"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="flex w-max gap-8 pb-4">
              {duplicatedVideos.map((video, index) => (
                <VideoCard key={`${video.id}-${Math.floor(index / videos.length)}`} video={video} index={index} />
              ))}
            </div>
          </div>
          
          {/* Enhanced "View More Videos" button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex justify-center mt-8"
          >
            <motion.a
              href="https://www.youtube.com/@cryptosmartnow"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            className="inline-flex items-center space-x-3 bg-[#81D7B4] hover:bg-[#76cbaa] text-white px-8 py-4 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 font-medium"
            >
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <span>View More Videos</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </motion.a>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default SavvyFinanceVideos
"use client"
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

// Utility function to generate YouTube thumbnail URL with fallback
const getYouTubeThumbnail = (videoId: string, quality: 'maxresdefault' | 'hqdefault' | 'mqdefault' | 'sddefault' = 'maxresdefault') => {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
};

// Function to fetch video title from YouTube oEmbed API
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
      className="flex-shrink-0 w-[320px] sm:w-[380px] md:w-[420px] lg:w-[450px] bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300"
    >
      <div className="relative">
        {showPlayer ? (
          <div className="aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1`}
              title={actualTitle}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
        ) : (
          <div className="relative aspect-video cursor-pointer" onClick={handlePlayClick}>
            {isInView && (
              <img
                src={thumbnailError ? fallbackThumbnailUrl : thumbnailUrl}
                alt={actualTitle}
                className="w-full h-full object-cover"
                loading="lazy"
                onLoad={() => setIsLoaded(true)}
                onError={() => {
                  if (!thumbnailError) {
                    setThumbnailError(true);
                  }
                }}
              />
            )}
            {!isLoaded && isInView && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#81D7B4] border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <h3 className="font-semibold text-lg text-gray-800 mb-4 line-clamp-2">
          {titleLoading ? (
            <div className="animate-pulse">
              <div className="h-5 bg-gray-300 rounded w-3/4 mb-1"></div>
              <div className="h-5 bg-gray-300 rounded w-1/2"></div>
            </div>
          ) : (
            actualTitle
          )}
        </h3>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-gray-500">Savvy Finance</span>
          <button
            onClick={handlePlayClick}
            className="text-[#81D7B4] hover:text-[#6BC49A] text-sm font-medium transition-colors duration-200"
          >
            Watch Now
          </button>
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
    <div
      ref={scrollerRef}
      className="relative w-full overflow-x-auto scrollbar-hide [mask-image:_linear_gradient(to_right,transparent_0,_black_128px,_black_calc(100%-200px),transparent_100%)]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex w-max gap-6 pb-4">
        {duplicatedVideos.map((video, index) => (
          <VideoCard key={`${video.id}-${Math.floor(index / videos.length)}`} video={video} index={index} />
        ))}
      </div>
    </div>
  )
}

export default SavvyFinanceVideos
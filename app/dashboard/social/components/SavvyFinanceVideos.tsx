'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowRight01Icon } from 'hugeicons-react';

const getYouTubeThumbnail = (videoId: string, quality: 'maxresdefault' | 'hqdefault' | 'mqdefault' = 'maxresdefault') => {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
};

type Video = {
  id: string;
  title: string;
  thumbnail?: string;
  url?: string;
  creator?: string;
  embedUrl?: string;
  duration?: string;
  views?: string;
};

const VideoCard = ({ video, index }: { video: Video; index: number }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const thumbnailUrl = video.thumbnail || getYouTubeThumbnail(video.id);
  const fallbackThumbnailUrl = getYouTubeThumbnail(video.id, 'hqdefault');

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    const currentElement = cardRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
      observer.disconnect();
    };
  }, []);

  const handlePlayClick = () => {
    setShowPlayer(true);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 15 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="w-full bg-white dark:bg-[#161616] rounded-3xl border border-gray-200/70 dark:border-white/10 shadow-sm overflow-hidden group transition-all duration-300 hover:border-[#81D7B4]/40 flex flex-col h-full"
    >
      <div className="relative w-full">
        {showPlayer ? (
          <div className="aspect-video w-full rounded-t-3xl overflow-hidden bg-black">
            <iframe
              src={`${video.embedUrl}?autoplay=1`}
              title={video.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
              onLoad={() => setIsLoaded(true)}
            />
          </div>
        ) : (
          <div className="relative aspect-video w-full rounded-t-3xl overflow-hidden bg-gray-900 group/thumbnail">
            <Image
              src={thumbnailError ? fallbackThumbnailUrl : thumbnailUrl}
              alt={video.title}
              fill
              className="object-cover transition-transform duration-700 group-hover/thumbnail:scale-105"
              onLoad={() => setIsLoaded(true)}
              onError={() => {
                if (thumbnailError) {
                  setIsLoaded(true);
                } else {
                  setThumbnailError(true);
                }
              }}
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 33vw"
            />
            
            {/* Dark overlay on hover */}
            <div className="absolute inset-0 bg-black/20 group-hover/thumbnail:bg-black/35 transition-colors" />

            {/* Duration badge */}
            {video.duration && (
              <span className="absolute bottom-3 right-3 bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs z-20">
                {video.duration}
              </span>
            )}
            
            {/* Play Button Overlay */}
            <motion.button
              onClick={handlePlayClick}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              aria-label={`Play ${video.title}`}
              className="absolute inset-0 m-auto w-12 h-12 sm:w-14 sm:h-14 bg-white/95 text-gray-900 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl z-20 cursor-pointer"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#81D7B4] ml-0.5 fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </motion.button>
            
            {!isLoaded && (
              <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-10">
                <div className="w-7 h-7 border-2 border-[#81D7B4] border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[9px] font-black text-[#81D7B4] uppercase tracking-wider bg-[#81D7B4]/10 px-2 py-0.5 rounded-md">
              {video.creator || 'BitSave'}
            </span>
          </div>
          
          <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white leading-snug line-clamp-2 mb-3 group-hover:text-[#81D7B4] transition-colors">
            {video.title}
          </h3>
        </div>
        
        <a
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2.5 px-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5 text-gray-700 dark:text-gray-300 hover:border-[#81D7B4]/50 hover:text-[#81D7B4] text-xs font-bold transition-all flex items-center justify-center gap-1.5 mt-auto"
        >
          <svg className="w-3.5 h-3.5 text-red-500 fill-current" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          <span>Watch on YouTube</span>
        </a>
      </div>
    </motion.div>
  );
};

export default function SavvyFinanceVideos({ videos }: { videos: Video[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollLeft = container.scrollLeft;
    const itemWidth = container.offsetWidth * 0.88;
    const index = Math.round(scrollLeft / itemWidth);
    setActiveIndex(Math.min(Math.max(0, index), videos.length - 1));
  };

  const scrollToIndex = (index: number) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const itemWidth = container.offsetWidth * 0.88;
    container.scrollTo({
      left: index * itemWidth,
      behavior: 'smooth'
    });
    setActiveIndex(index);
  };

  return (
    <div className="space-y-4 w-full">
      {/* Mobile Horizontal Snap Carousel + Desktop 2-Column Grid */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="w-full overflow-x-auto pb-4 pt-1 flex md:grid md:grid-cols-2 gap-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {videos.map((video, index) => (
          <div 
            key={video.id} 
            className="w-[88%] sm:w-[70%] md:w-auto shrink-0 snap-center md:snap-align-none flex flex-col"
          >
            <VideoCard video={video} index={index} />
          </div>
        ))}
      </div>

      {/* Carousel Pagination Dots (Mobile Only) */}
      <div className="flex md:hidden justify-center items-center gap-1.5 py-1">
        {videos.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollToIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              activeIndex === i 
                ? 'w-6 h-2 bg-[#81D7B4]' 
                : 'w-2 h-2 bg-gray-300 dark:bg-white/20'
            }`}
          />
        ))}
      </div>
      
      {/* Footer Link */}
      <div className="flex justify-center pt-2">
        <a
          href="https://www.youtube.com/@bitsaveprotocol"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-[#81D7B4] transition-colors"
        >
          <span>Explore All Videos on YouTube</span>
          <ArrowRight01Icon className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}

"use client"
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// Declare Twitter widgets for TypeScript
declare global {
  interface Window {
    twttr: {
      widgets: {
        load: () => void;
        createTweet: (tweetId: string, container: HTMLElement, options?: object) => Promise<HTMLElement>;
      };
    };
  }
}

// Twitter links will be passed as props

const TwitterCard = ({ url, index }: { url: string; index: number }) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState(false)
  const [loadingTimeout, setLoadingTimeout] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const isMountedRef = useRef(true)
  const tweetId = url.split('/').pop()?.split('?')[0]

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

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

  useEffect(() => {
    if (!tweetId || !containerRef.current) return
    
    // Set a timeout to show fallback if loading takes too long
    const fallbackTimeout = setTimeout(() => {
      if (isMountedRef.current && !isLoaded) {
        setLoadingTimeout(true)
        setError(true)
      }
    }, 8000)

    const loadTweet = async () => {
      try {
        if (!window.twttr || !window.twttr.widgets) {
          if (isMountedRef.current) {
            setError(true)
          }
          return
        }

        if (containerRef.current && isMountedRef.current) {
          const tweetElement = await window.twttr.widgets.createTweet(tweetId, containerRef.current, {
            theme: 'light',
            width: 350,
            dnt: true,
            conversation: 'none'
          })

          if (isMountedRef.current) {
            if (tweetElement) {
              setIsLoaded(true)
              setError(false)
              clearTimeout(fallbackTimeout)
            } else {
              setError(true)
            }
          }
        }
      } catch (err) {
        console.error('Error loading tweet:', err)
        if (isMountedRef.current) {
          setError(true)
        }
      }
    }

    // Add a small delay to prevent overwhelming the API
    const timeoutId = setTimeout(loadTweet, index * 200)
    
    return () => {
      clearTimeout(timeoutId)
      clearTimeout(fallbackTimeout)
    }
  }, [tweetId, index, isLoaded])
  
  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="flex-shrink-0 w-[320px] sm:w-[380px] md:w-[420px] lg:w-[450px] relative bg-white/20 backdrop-blur-2xl rounded-3xl border border-white/30 shadow-[0_20px_60px_-15px_rgba(129,215,180,0.3),0_8px_32px_-8px_rgba(22,50,57,0.2),inset_0_1px_0_rgba(255,255,255,0.4)] overflow-hidden group hover:shadow-[0_25px_80px_-15px_rgba(129,215,180,0.4),0_12px_40px_-8px_rgba(22,50,57,0.3)] transition-all duration-700"
    >
      {/* Noise texture overlay */}
      <div className="absolute inset-0 bg-[url('/noise.jpg')] opacity-[0.02] mix-blend-overlay pointer-events-none"></div>
      
      {/* Decorative elements */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#81D7B4]/30 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
            <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-[#81D7B4]/25 rounded-full blur-3xl group-hover:scale-105 transition-transform duration-1000"></div>
      
      <div className="relative z-10 p-6">
        {/* Enhanced background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/30 to-[#81D7B4]/10 opacity-80 rounded-3xl"></div>
        
        <div className="relative z-10">
          {/* Platform badge */}
          <div className="flex items-center mb-4">
            <div className="w-2 h-2 bg-[#81D7B4] rounded-full mr-2 animate-pulse"></div>
            <span className="text-xs font-semibold text-gray-600/80 tracking-wide uppercase flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              X (Twitter)
            </span>
          </div>
          
          {tweetId ? (
            <div ref={containerRef} className="tweet-container min-h-[150px] max-h-[400px] w-full overflow-hidden rounded-2xl">
              {!isLoaded && !error && (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-2 border-[#81D7B4] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600/80 font-medium">Loading tweet...</p>
                </div>
              )}
              {error && (
                <div className="text-center p-6">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-[#81D7B4]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-[#81D7B4]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 tracking-tight">Tweet Unavailable</h3>
                    {loadingTimeout ? (
                      <p className="text-gray-600/80 mb-6 text-sm font-medium">This tweet couldn&apos;t be loaded due to browser security settings or ad blockers.</p>
                    ) : (
                      <p className="text-gray-600/80 mb-6 text-sm font-medium">Unable to display this tweet content.</p>
                    )}
                  </div>
                  <motion.a 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#81D7B4] to-[#81D7B4]/90 text-white rounded-xl shadow-[0_4px_12px_rgba(129,215,180,0.4)] hover:shadow-[0_8px_20px_rgba(129,215,180,0.5)] transition-all duration-300 font-semibold"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    View on X
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </motion.a>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-[#81D7B4]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
                </svg>
              </div>
              <p className="text-gray-600/80 font-medium mb-4">Unable to load tweet</p>
              <motion.a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="text-[#81D7B4] hover:text-[#6bc4a1] font-semibold transition-colors duration-200"
              >
                View on X
              </motion.a>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const TwitterFeed = ({ links }: { links: string[] }) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [tweetsLoaded, setTweetsLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);

  useEffect(() => {
    // Check if script already exists
    const existingScript = document.querySelector('script[src="https://platform.twitter.com/widgets.js"]');
    
    if (existingScript) {
      // Script already loaded, check if twttr is available
      if (window.twttr) {
        setTweetsLoaded(true);
      } else {
        // Script exists but twttr not available, might be blocked
        setScriptError(true);
      }
      return;
    }

    // Load Twitter widgets script only when component mounts
    const script = document.createElement('script');
    script.src = 'https://platform.twitter.com/widgets.js';
    script.async = true;
    
    script.onload = () => {
      if (window.twttr) {
        window.twttr.widgets.load();
        setTweetsLoaded(true);
      } else {
        setScriptError(true);
      }
    };
    
    script.onerror = () => {
      console.warn('Twitter widgets script failed to load - likely blocked by ad blocker or network restrictions');
      setScriptError(true);
    };
    
    // Set a timeout in case the script never loads
    const scriptTimeout = setTimeout(() => {
      if (!tweetsLoaded && !scriptError) {
        console.warn('Twitter widgets script loading timeout');
        setScriptError(true);
      }
    }, 10000); // 10 second timeout
    
    document.head.appendChild(script);

    return () => {
      clearTimeout(scriptTimeout);
      // Don't remove script on unmount as it might be used by other components
    };
  }, [tweetsLoaded, scriptError]);

  useEffect(() => {
    if (!tweetsLoaded) return;
    
    const scroller = scrollerRef.current;
    if (!scroller) return;

    let animationFrameId: number;
    const scroll = () => {
      if (!isHovered) {
        scroller.scrollLeft += 0.5;
        if (scroller.scrollLeft >= scroller.scrollWidth / 2) {
          scroller.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isHovered, tweetsLoaded]);

  const duplicatedLinks = [...links, ...links];

  return (
    <div className="relative">
      {/* Enhanced container with dashboard styling */}
      <div className="relative bg-white/20 backdrop-blur-2xl rounded-3xl border border-white/30 shadow-[0_20px_60px_-15px_rgba(129,215,180,0.3),0_8px_32px_-8px_rgba(22,50,57,0.2),inset_0_1px_0_rgba(255,255,255,0.4)] p-8 overflow-hidden">
        {/* Noise texture overlay */}
        <div className="absolute inset-0 bg-[url('/noise.jpg')] opacity-[0.02] mix-blend-overlay pointer-events-none"></div>
        
        {/* Background decorative elements */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#81D7B4]/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-[#81D7B4]/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        
        <div className="relative z-10">
          {/* Enhanced scrolling container */}
          <div
            ref={scrollerRef}
            className="relative w-full overflow-x-auto scrollbar-hide [mask-image:_linear_gradient(to_right,transparent_0,_black_128px,_black_calc(100%-200px),transparent_100%)]"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="flex w-max gap-8 pb-4">
              {duplicatedLinks.map((url, index) => {
                const tweetId = url.match(/status\/(\d+)/)?.[1] || url;
                const keyPrefix = Math.floor(index / links.length);
                return (
                  <TwitterCard 
                    key={`${tweetId}-${keyPrefix}`} 
                    url={url} 
                    index={index} 
                  />
                );
              })}
            </div>
          </div>
          
          {/* Enhanced "Follow" button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex justify-center mt-8"
          >
            <motion.a
              href="https://x.com/bitsaveprotocol"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative group overflow-hidden rounded-2xl bg-gradient-to-r from-[#81D7B4] to-[#81D7B4]/90 shadow-[0_4px_12px_rgba(129,215,180,0.4)] hover:shadow-[0_8px_20px_rgba(129,215,180,0.5)] transition-all duration-500 px-8 py-4"
            >
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/20 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500"></div>
              
              <div className="relative z-10 flex items-center space-x-3 text-white font-semibold">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span>Follow @bitsaveprotocol</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </motion.a>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TwitterFeed;
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
          // IMPORTANT: Check if we already have content to avoid recreation
          // and the dreaded "removeChild" error from React/DOM conflicts
          if (containerRef.current.childElementCount > 0) {
             return;
          }

          // Safe clear
          if (containerRef.current) {
             try {
                // Using replaceChildren() is safer than innerHTML = ''
                containerRef.current.replaceChildren(); 
             } catch (e) {
                containerRef.current.innerHTML = '';
             }
          }
          
          try {
             // Use a temporary container first to avoid React hydration issues
             const tempContainer = document.createElement('div');
             const tweetElement = await window.twttr.widgets.createTweet(tweetId, tempContainer, {
                theme: 'light',
                dnt: true,
                conversation: 'none'
             });

             if (isMountedRef.current) {
               if (tweetElement) {
                 containerRef.current.appendChild(tweetElement);
                 setIsLoaded(true);
                 setError(false);
                 setLoadingTimeout(false);
                 clearTimeout(fallbackTimeout);
               } else {
                 setError(true);
               }
             }
          } catch (err) {
             console.error("Error creating tweet:", err);
             if (isMountedRef.current) setError(true);
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
  }, [tweetId, index]) // Removed isLoaded dependency to prevent re-runs

  
  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="break-inside-avoid mb-6 relative bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
    >
      <div className="relative z-10 p-4 sm:p-5">
        
        {/* Platform badge */}
        <div className="flex items-center mb-3">
          <div className="w-1.5 h-1.5 bg-black rounded-full mr-2"></div>
          <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase flex items-center">
            X (Twitter)
          </span>
        </div>
        
        {tweetId ? (
          <div ref={containerRef} className="tweet-container w-full overflow-hidden min-h-[100px]">
            {!isLoaded && !error && (
              <div className="text-center py-12">
                <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-xs text-gray-400 font-medium">Loading...</p>
              </div>
            )}
            {error && (
              <div className="text-center p-4">
                <div className="mb-4">
                  <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">Unavailable</h3>
                  <p className="text-xs text-gray-500 mb-4">Tweet couldn't be loaded.</p>
                </div>
                <motion.a 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg text-xs font-bold"
                >
                  View on X
                </motion.a>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 text-center">
             <p className="text-sm text-gray-500">Invalid Tweet URL</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const TwitterFeed = ({ links }: { links: string[] }) => {
  const [tweetsLoaded, setTweetsLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);

  useEffect(() => {
    // Check if script already exists
    const existingScript = document.querySelector('script[src="https://platform.twitter.com/widgets.js"]');
    
    if (existingScript) {
      if (window.twttr) {
        setTweetsLoaded(true);
      } else {
        // Poll for window.twttr if script exists but object not ready
        const interval = setInterval(() => {
          if (window.twttr) {
            setTweetsLoaded(true);
            clearInterval(interval);
          }
        }, 100);
        
        // Timeout after 5 seconds
        setTimeout(() => {
          clearInterval(interval);
          if (!window.twttr) setScriptError(true);
        }, 5000);
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
      console.warn('Twitter widgets script failed to load');
      setScriptError(true);
    };
    
    document.head.appendChild(script);

    return () => {
      // Cleanup if needed
    };
  }, []);

  return (
    <>
      {!tweetsLoaded && !scriptError && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-gray-50 rounded-3xl animate-pulse border border-gray-100"></div>
          ))}
        </div>
      )}
      
      {scriptError && (
        <div className="text-center p-8 bg-gray-50 rounded-2xl border border-gray-100">
           <p className="text-gray-500 mb-2">Unable to load Twitter feed</p>
           <button 
             onClick={() => window.location.reload()}
             className="text-sm font-bold text-[#81D7B4] hover:underline"
           >
             Refresh Page
           </button>
        </div>
      )}

      {tweetsLoaded && (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {links.map((url, index) => {
            const tweetId = url.match(/status\/(\d+)/)?.[1] || url;
            return (
              <TwitterCard 
                key={`${tweetId}-${index}`} 
                url={url} 
                index={index} 
              />
            );
          })}
        </div>
      )}
    </>
  );
};

export default TwitterFeed;

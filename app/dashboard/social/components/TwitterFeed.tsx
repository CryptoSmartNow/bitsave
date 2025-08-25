"use client"
import { useState, useEffect, useRef } from 'react';

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
  const containerRef = useRef<HTMLDivElement>(null)
  const isMountedRef = useRef(true)
  const tweetId = url.split('/').pop()?.split('?')[0]

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
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
    <div className="flex-shrink-0 w-[320px] sm:w-[380px] md:w-[420px] lg:w-[450px] bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#81D7B4]/10 rounded-full blur-2xl"></div>
      <div className="relative z-10 p-4">
        {tweetId ? (
          <div ref={containerRef} className="tweet-container min-h-[150px] max-h-[400px] w-full overflow-hidden">
            {!isLoaded && !error && (
              <div className="text-center">
                <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-[#81D7B4] rounded-full mx-auto mb-2"></div>
                <p className="text-gray-500">Loading tweet...</p>
              </div>
            )}
            {error && (
              <div className="text-center p-6">
                <div className="mb-4">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Tweet Unavailable</h3>
                  {loadingTimeout ? (
                    <p className="text-gray-500 mb-4 text-sm">This tweet couldn&apos;t be loaded due to browser security settings or ad blockers.</p>
                  ) : (
                    <p className="text-gray-500 mb-4 text-sm">Unable to display this tweet content.</p>
                  )}
                </div>
                <a 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center px-4 py-2 bg-[#81D7B4] text-white rounded-lg hover:bg-[#6bc4a1] transition-colors duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  View on X
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-500">Unable to load tweet</p>
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-[#81D7B4] hover:underline">
              View on X
            </a>
          </div>
        )}
      </div>
    </div>
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
    <div
      ref={scrollerRef}
      className="relative w-full overflow-x-auto scrollbar-hide [mask-image:_linear_gradient(to_right,transparent_0,_black_128px,_black_calc(100%-200px),transparent_100%)]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex w-max gap-6 pb-4">
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
  );
};

export default TwitterFeed;
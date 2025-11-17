"use client";

import { useEffect, useState } from "react";
import { FiChevronUp } from "react-icons/fi";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const getScrollY = () => {
      const el = document.scrollingElement || document.documentElement;
      return el.scrollTop || window.scrollY || 0;
    };
    const onScroll = () => {
      setVisible(getScrollY() > 300);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = () => {
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      window.scrollTo(0, 0);
    }
  };

  return (
    <button
      type="button"
      aria-label="Scroll to top"
      onClick={handleClick}
      className={`fixed z-[9999] inline-flex items-center justify-center rounded-full shadow-xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#81D7B4] focus-visible:ring-offset-2 opacity-100 translate-y-0 bg-gradient-to-br from-[#81D7B4] to-[#6BC5A0] text-white h-12 w-12 border border-white/40 hover:shadow-2xl`}
      style={{
        bottom: "calc(2rem + env(safe-area-inset-bottom, 0px))",
        right: "calc(2rem + env(safe-area-inset-right, 0px))"
      }}
    >
      <FiChevronUp className="h-6 w-6" />
    </button>
  );
}
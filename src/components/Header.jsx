import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); // State to track menu open/close
  const router = useRouter();
  const { address, isConnected } = useAccount();

  useEffect(() => {
    // Ensure Bootstrap JS is loaded
    const script = document.createElement("script");
    script.src =
      "https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.bundle.min.js";
    script.async = true;
    document.body.appendChild(script);

    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      document.body.removeChild(script);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Function to toggle menuOpen state
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="top_home_wraper">
      {/* <!-- Header Start --> */}
      <header className={`fixed ${scrolled ? "fix_style" : ""}`}>
        {/* <!-- container start --> */}
        <div className="container">
          {/* <!-- navigation bar --> */}
          <nav className="navbar navbar-expand-lg">
            <a className="navbar-brand" href="/">
              <img src="/bit1.png" alt="image" />
            </a>
            <button
              className="navbar-toggler"
              type="button"
              data-toggle="collapse"
              data-target="#navbarSupportedContent"
              aria-controls="navbarSupportedContent"
              aria-expanded={menuOpen ? "true" : "false"} // Update aria-expanded based on menuOpen state
              aria-label="Toggle navigation"
              onClick={toggleMenu} // Toggle menuOpen state on button click
            >
              <span className="navbar-toggler-icon">
                <div className={`toggle-wrap ${menuOpen ? "open" : ""}`}>
                  {/* Update toggle-wrap class based on menuOpen state */}
                  <span className="toggle-bar"></span>
                  {/* <span className="toggle-bar"></span>
                  <span className="toggle-bar"></span> */}
                </div>
              </span>
            </button>

            <div
              className={`collapse navbar-collapse ${menuOpen ? "show" : ""}`}
              id="navbarSupportedContent"
            >
              <ul className="navbar-nav ml-auto">
                <li className="nav-item">
                  <a className={`nav-link ${menuOpen ? "text-dark" : ""}`} href="/">
                    Home
                  </a>
                </li>
                <li className="nav-item">
                  <a className={`nav-link ${menuOpen ? "text-dark" : ""}`} href="#protocol">
                    Protocol
                  </a>
                </li>
                <li className="nav-item">
                  <a className={`nav-link ${menuOpen ? "text-dark" : ""}`} href="#hiw">
                    How it works
                  </a>
                </li>
                <li className="nav-item">
                  <a className={`nav-link ${menuOpen ? "text-dark" : ""}`} href="#team">
                    Team
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className={`nav-link ${menuOpen ? "text-dark" : ""}`}
                    href="https://docs.google.com/document/d/11qa_KT4dhbrIQHY4ma8zgsYo-t-WwKdQV-Sf-RzHf54/edit?usp=sharing"
                    target="_blank"
                  >
                    One-pager
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className={`nav-link ${menuOpen ? "text-dark" : ""}`}
                    href="https://cryptosmartnow.io/contact"
                  >
                    Contact
                  </a>
                </li>
                <li className="nav-item">
                  <a className={`nav-link dark_btn`} href="/dashboard">
                    Open App
                  </a>
                </li>
              </ul>
            </div>
          </nav>
        </div>
        {/* <!-- container end --> */}
      </header>

      {/* <!-- Banner-Section-Start --> */}
      <section className="banner_section">
        <div className="container">
          <div className="banner_text">
            <div
              className="ban_inner_text"
              data-aos="fade-up"
              data-aos-duration="1500"
            >
              <span>Secured, Easier and Faster</span>
              <h1>The savings Protocol of #web3 Finance</h1>
              <p>
                Bitsave Protocol helps you save and earn in Crypto without
                losing your savings to Crypto Market volatility.
              </p>
            </div>
            <div className="row container justify-content-center d-flex align-self-center my-2 text-center">
              <div className="btn_group col-lg-3 mb-3 text-center">
                <a
                  href="https://forms.gle/TgQm8DfRnsiPmpPt6"
                  className="btn btn_main"
                  data-aos="fade-right"
                  data-aos-duration="1500"
                >
                  Join our waitlist <i className="fas fa-scroll"></i>
                </a>
              </div>
              <div className="btn_group col-lg-3 mb-3 text-center">
                <a
                  href="https://youtube.com/playlist?list=PLBVK_AKYV8sPvpV_bihIaAA0b2tsAHU5q"
                  target="_blank"
                  className="btn btn_main"
                  data-aos="fade-right"
                  data-aos-duration="1500"
                >
                  Watch Videos<i className="fas fa-play-circle"></i>
                </a>
              </div>
            </div>
          </div>
          <div
            className="banner_images"
            data-aos="fade-up"
            data-aos-duration="1500"
          >
            <img src="/banner.png" alt="image" className="img-fluid" />
            <div className="sub_images">
              <img
                className="moving_animation img-fluid"
                src="/banner1.png"
                alt="image"
                style={{ height: "150px" }}
              />
              <img
                className="moving_animation img-fluid"
                src="/banner2.png"
                alt="image"
                style={{ height: "150px" }}
              />
              <img
                className="moving_animation img-fluid"
                src="/banner3.png"
                alt="image"
                style={{ height: "150px" }}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Header;

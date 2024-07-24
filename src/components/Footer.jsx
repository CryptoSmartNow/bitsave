const Footer = () => {
    return (
        <main>
            <section className="need_section" data-aos="fade-in" data-aos-duration="1500" data-aos-delay="100" id="whitepaper">
                    <div className="container">
                        <div className="need_block">
                            <div className="need_text">
                                <div className="section_title">
                                    <h2 className="text-capitalize">Bitsave White Paper One Pager</h2>
                                </div>
                            </div>
                            <div className="need_action">
                                <a href="https://docs.google.com/document/d/11qa_KT4dhbrIQHY4ma8zgsYo-t-WwKdQV-Sf-RzHf54/edit?usp=sharing" className="btn">Read</a>
                            </div>
                        </div>
                    </div>
                </section>
                <footer>
                    <div className="top_footer" id="contact">
                        <div className="footer_inner">
                            {/* <!-- container start --> */}
                            <div className="container">
                                {/* <!-- row start --> */}
                                <div className="row">
                                    {/* <!-- footer link 1 --> */}
                                    <div className="col-lg-4 col-md-6 col-12">
                                        <div className="abt_side">
                                            <div className="logo"> <img src="/bit1.png" alt="image" /></div>
                                            <p>Bitsave Protocol helps you save in Crypto without losing your savings to Crypto Market volatility.</p>
                                        </div>
                                    </div>

                                    {/* <!-- footer link 2 --> */}
                                    <div className="col-lg-2 col-md-6 col-12">
                                        <div className="links">
                                            <h3>Useful Links</h3>
                                            <ul>
                                                <li><a href="/">Home</a></li>
                                                <li><a href="#team">Team</a></li>
                                                <li><a href="https://cryptosmartnow.io/blog">Blog</a></li>
                                            </ul>
                                        </div>
                                    </div>

                                    {/* <!-- footer link 3 --> */}
                                    <div className="col-lg-3 col-md-6 col-12">
                                        <div className="links">
                                            <h3>Help & Suport</h3>
                                            <ul>
                                                <li><a href="https://cryptosmartnow.io/contact">Contact us</a></li>
                                                <li><a href="#">FAQs</a></li>
                                                <li><a href="#hiw">How it works</a></li>
                                            </ul>
                                        </div>
                                    </div>

                                    {/* <!-- footer link 4 --> */}

                                </div>
                                {/* <!-- row end --> */}
                            </div>
                            {/* <!-- container end --> */}
                        </div>
                    </div>

                    {/* <!-- last footer --> */}
                    <div className="bottom_footer">
                        {/* <!-- container start --> */}
                        <div className="container">
                            {/* <!-- row start --> */}
                            <div className="row">
                                <div className="col-md-4">
                                    <p>© Copyrights 2023. All rights reserved.</p>
                                </div>
                                <div className="col-md-4">
                                    <ul className="social_media">
                                        <li><a href="https://youtube.com/channel/UC1cIpggpet2ut2KYN6_mV-Q"><i className="fab fa-youtube"></i></a></li>
                                        <li><a href="https://twitter.com/cryptosmartnow"><i className="fab fa-twitter"></i></a></li>
                                        <li><a href="https://instagram.com/cryptosmartnow_"><i className="fab fa-instagram"></i></a></li>
                                        <li><a href="https://www.linkedin.com/company/cryptosmartnow"><i className="fab fa-linkedin"></i></a></li>

                                    </ul>
                                </div>
                                <div className="col-md-4">
                                    <p className="developer_text">Powered by <a href="https://cryptosmartnow.io" target="blank">CryptoSmart</a></p>
                                </div>
                            </div>
                            {/* <!-- row end --> */}
                        </div>
                        {/* <!-- container end --> */}
                    </div>

                    {/* <!-- go top button --> */}
                    <div className="go_top" id="Gotop">
                        <span><i className="fas fa-arrow-up"></i></span>
                    </div>
                </footer>
        </main>
    );
};

export default Footer;
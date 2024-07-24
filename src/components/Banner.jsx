const Banner = () => {
    return (
        <section className="banner_section">
                        <div className="container">
                            <div className="banner_text">
                                <div className="ban_inner_text" data-aos="fade-up" data-aos-duration="1500">
                                    <span>Secured, Easier and Faster</span>
                                    <h1>The savings Protocol of #web3 Finance</h1>
                                    <p>Bitsave Protocol helps you save and earn in Crypto without losing your savings to Crypto Market volatility.
                                    </p>
                                </div>
                                <div className="row container justify-content-center d-flex align-self-center my-2 text-center">
                                    <div className="btn_group col-lg-3 mb-3 text-center">
                                        <a href="https://forms.gle/TgQm8DfRnsiPmpPt6" className="btn btn_main" data-aos="fade-right" data-aos-duration="1500">Join our waitlist <i className="fas fa-scroll"></i></a>
                                    </div>

                                    <div className="btn_group col-lg-3 mb-3 text-center">
                                        <a href="https://youtube.com/playlist?list=PLBVK_AKYV8sPvpV_bihIaAA0b2tsAHU5q" target="_blank" className="btn btn_main" data-aos="fade-right" data-aos-duration="1500">Watch Videos<i className="fas fa-play-circle"></i></a>
                                    </div>
                                </div>

                            </div>
                            <div className="banner_images" data-aos="fade-up" data-aos-duration="1500">
                                <img src="/banner.png" alt="image" className="img-fluid" />
                                <div className="sub_images">
                                    <img className="moving_animation img-fluid" src="/banner1.png" alt="image" style={{ height: '150px' }} />
                                    <img className="moving_animation img-fluid" src="/banner2.png" alt="image" style={{ height: '150px' }} />
                                    <img className="moving_animation img-fluid" src="/banner3.png" alt="image" style={{ height: '150px' }} />
                                </div>
                            </div>
                        </div>
                    </section>
    );
};

export default Banner;
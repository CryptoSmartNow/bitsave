const HowItWorks = () => {
    return (
        <section className="row_am advance_feature_section" id="hiw">
        {/* <!-- container start --> */}
        <div className="container">
            <div className="advance_feature_inner" data-aos="fade-in" data-aos-duration="1500" data-aos-delay="100">

                {/* <!-- Section Title --> */}
                <div className="section_title" data-aos="fade-in" data-aos-duration="1500" data-aos-delay="100">
                    <h2>How It Works</h2>
                    <p>Bitsave isn't just another product, it's a new value chain, The web 3 space is used to DeFi, and now we're introducing them to SaveFi.</p>
                </div>
                {/* <!-- row start --> */}
                <div className="row">
                    <div className="col-lg-6 col-md-12" data-aos="fade-up" data-aos-duration="1500">
                        <div className="feature_block">
                            <div className="icon">
                                <img src="/check.svg" alt="image" />
                            </div>
                            <div className="text_info">
                                <h3>Users typically save in a Fiat-Backed stable coin (We don’t want a Terra Situation😕)</h3>

                            </div>
                        </div>
                    </div>
                    <div className="col-lg-6 col-md-12" data-aos="fade-up" data-aos-duration="1500">
                        <div className="feature_block">
                            <div className="icon">
                                <img src="/check.svg" alt="image" />
                            </div>
                            <div className="text_info">
                                <h3>Users earn interest in a volatile token, typically the native token of the Bitsave Protocol.</h3>

                            </div>
                        </div>
                    </div>
                    <div className="col-lg-6 col-md-12" data-aos="fade-up" data-aos-duration="1500">
                        <div className="feature_block">
                            <div className="icon">
                                <img src="/check.svg" alt="image" />
                            </div>
                            <div className="text_info">
                                <h3>Users can create a savings plan and make unlimited deposits.</h3>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-6 col-md-12" data-aos="fade-up" data-aos-duration="1500">
                        <div className="feature_block">
                            <div className="icon">
                                <img src="/check.svg" alt="image" />
                            </div>
                            <div className="text_info">
                                <h3>Users pay a $1 fee per savings plan they create.</h3>
                            </div>
                        </div>
                    </div>
                </div>
                {/* <!-- row end --> */}
            </div>
        </div>
        {/* <!-- container end --> */}
    </section>

    );
};

export default HowItWorks;
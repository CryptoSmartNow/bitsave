const ProtocolSections = () => {
    return (
        <section id="protocol">
        <section className="row_am communication_section trusted_section">
            <div className="container">
                <div className="row">
                    <div className="col-md-6">
                        <div className="communication_text" data-aos="fade-in" data-aos-duration="2000" data-aos-delay="100">
                            <div className="section_title">
                                <h2>Users create a savings plan and deposit.</h2>
                                <p className="text-justify">Bitsave's savings plan creates a child contract under the parent contract, securing deposits to the user's wallet. Hackers cannot access funds unless they have access to the wallet, unlike DeFi pools.</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="communication_image" data-aos="fade-in" data-aos-duration="1000">
                            <img data-aos="fade-in" data-aos-duration="2000" data-aos-delay="100" className="moving_animation" src="/banner2.png" alt="image" />
                            <img data-aos="fade-in" data-aos-duration="2000" data-aos-delay="100" className="moving_animation" src="/add.png" alt="image" />
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section className="row_am communication_section">
            <div className="container">
                <div className="row">
                    <div className="col-md-6">
                        <div className="communication_image" data-aos="fade-in" data-aos-duration="1000">
                            <img data-aos="fade-in" data-aos-duration="2000" data-aos-delay="100" className="moving_animation" src="/int.png" alt="image" />
                            <img data-aos="fade-in" data-aos-duration="2000" data-aos-delay="100" className="moving_animation" src="/banner3.png" alt="image" />
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="communication_text" data-aos="fade-in" data-aos-duration="2000" data-aos-delay="100">
                            <div className="section_title">
                                <h2>Users' Interest</h2>
                                <p className="text-justify">Bitsave calculates interest using a formula that combines variables and constants, including its own rate formula. Additionally, the protocol has a buy-back mechanism for its native tokens, ensuring their stability and liquidity.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section className="row_am communication_section">
            <div className="container">
                <div className="row">

                    <div className="col-md-6">
                        <div className="communication_text" data-aos="fade-in" data-aos-duration="2000" data-aos-delay="100">
                            <div className="section_title">
                                <h2>Users' Savings Plans and Fees</h2>
                                <p className="text-justify">Users are charged a 1-time savings fee on savings plan creation (child contract), every fee is split in a 50:50 ratio, where 1 part goes to a buy-back wallet to buy back the protocol native tokens from any AMM or Dex in the ecosystem.</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="communication_image" data-aos="fade-in" data-aos-duration="1000">
                            <img data-aos="fade-in" data-aos-duration="2000" data-aos-delay="100" className="moving_animation" src="/savings.png" alt="image" />
                            <img data-aos="fade-in" data-aos-duration="2000" data-aos-delay="100" className="moving_animation" src="/create.png" alt="image" />
                        </div>
                    </div>
                </div>
            </div>
        </section>

    </section>
    );
};

export default ProtocolSections;
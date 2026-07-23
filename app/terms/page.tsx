import Link from 'next/link';

export default function TermsAndConditions() {
    return (
        <div className="min-h-screen bg-[#020611] text-[#F9F9FB] font-sans selection:bg-[#81D7B4] selection:text-[#0F1825]">
            <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-12 pb-8 border-b border-[#1E2F45]">
                    <Link href="/bizswap/app" className="inline-flex items-center text-[#7B8B9A] hover:text-[#81D7B4] transition-colors mb-8 text-sm font-bold tracking-widest uppercase">
                        <span>← Back to Platform</span>
                    </Link>
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">Terms & Conditions</h1>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-[#7B8B9A] text-sm">
                        <span className="font-bold tracking-wide uppercase text-[#81D7B4]">BIZMARKET PROTOCOL</span>
                        <span className="hidden sm:inline">•</span>
                        <span>Effective Date: June 5, 2026</span>
                        <span className="hidden sm:inline">•</span>
                        <span>Version 1.0</span>
                        <span className="hidden sm:inline">•</span>
                        <a href="mailto:legal@bizmarket.io" className="hover:text-[#F9F9FB] transition-colors">legal@bizmarket.io</a>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-12 text-[#B0B8C1] leading-relaxed">
                    
                    <div className="p-6 bg-[#080E18] border border-[#1E2F45]">
                        <h2 className="text-[#F9F9FB] font-bold text-lg mb-4 uppercase tracking-wide">IMPORTANT</h2>
                        <p>Please read these Terms and Conditions carefully before using the BizMarket platform, BizSwap, or purchasing any BizShares instruments. By connecting your wallet, creating an account, or completing any transaction on BizMarket, you confirm that you have read, understood, and agree to be bound by these Terms. If you do not agree, do not use the platform.</p>
                    </div>

                    <section>
                        <h3 className="text-2xl font-bold text-[#F9F9FB] mb-6">1. Introduction and Parties</h3>
                        <div className="space-y-4">
                            <p>These Terms and Conditions ("Terms") govern your access to and use of the BizMarket protocol, BizSwap exchange, BizLend lending platform, and all associated products, services, smart contracts, dashboards, and digital interfaces (collectively, the "Platform") operated by BizMarket and its affiliated entities ("BizMarket", "we", "us", or "our").</p>
                            <p>By accessing or using the Platform in any way, including but not limited to connecting a digital wallet, purchasing BizShares instruments, viewing your dashboard, or receiving yield payments, you ("User", "you", or "your") agree to these Terms in full. These Terms constitute a legally binding agreement between you and BizMarket.</p>
                            <p>BizMarket is a real-world asset (RWA) protocol that enables users to purchase on-chain instruments backed by the revenue of real businesses, private credit pools, and sovereign government securities. The Platform operates on a blockchain network.</p>
                            
                            <h4 className="text-[#F9F9FB] font-bold mt-8 mb-3">1.1 Scope of These Terms</h4>
                            <p>These Terms apply to all products and services offered by BizMarket, including:</p>
                            <ul className="list-disc pl-5 space-y-2 mt-2">
                                <li><strong className="text-[#F9F9FB]">BizSwap:</strong> the decentralised exchange interface through which users swap stablecoins and tokens for BizShares instruments</li>
                                <li><strong className="text-[#F9F9FB]">BizShares:</strong> the family of on-chain instruments comprising BizYield, BizCredit, and BizBond</li>
                                <li><strong className="text-[#F9F9FB]">BizYield:</strong> tokenized revenue share instruments backed by the monthly revenue of listed businesses</li>
                                <li><strong className="text-[#F9F9FB]">BizCredit:</strong> tokenized credit instruments backed by BizMarket's private lending pool</li>
                                <li><strong className="text-[#F9F9FB]">BizBond:</strong> tokenized fixed income instruments backed by sovereign government securities</li>
                                <li><strong className="text-[#F9F9FB]">BizLend:</strong> the stock-collateralised lending protocol enabling users to borrow cNGN against tokenized stock assets</li>
                                <li>The BizMarket dashboard, user interface, APIs, and all digital infrastructure</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-2xl font-bold text-[#F9F9FB] mb-6">2. Eligibility and Access</h3>
                        <div className="space-y-4">
                            <h4 className="text-[#F9F9FB] font-bold mt-6 mb-3">2.1 Who May Use the Platform</h4>
                            <p>To use BizMarket, you must:</p>
                            <ul className="list-disc pl-5 space-y-2 mt-2">
                                <li>Be at least 18 years of age, or the legal age of majority in your jurisdiction, whichever is higher</li>
                                <li>Have the legal capacity to enter into binding contracts under the laws of your jurisdiction</li>
                                <li>Not be a resident of, or located in, any jurisdiction where the use of blockchain-based financial instruments is prohibited or restricted by applicable law</li>
                                <li>Not be a person or entity subject to sanctions administered by the United Nations, the United States Office of Foreign Assets Control (OFAC), the European Union, or any other applicable sanctions authority</li>
                                <li>Not be using the Platform for any unlawful purpose including money laundering, terrorist financing, or tax evasion</li>
                            </ul>

                            <h4 className="text-[#F9F9FB] font-bold mt-8 mb-3">2.2 Restricted Jurisdictions</h4>
                            <p>BizMarket does not knowingly offer services to users in jurisdictions where such services would be in violation of local law. It is your sole responsibility to ensure that your use of the Platform is lawful in your jurisdiction. BizMarket reserves the right to restrict access from any jurisdiction at any time without notice.</p>

                            <h4 className="text-[#F9F9FB] font-bold mt-8 mb-3">2.3 No Financial Advice</h4>
                            <p>Nothing on the BizMarket Platform constitutes financial advice, investment advice, legal advice, or tax advice. All content, including instrument descriptions, yield estimates, APR figures, and dashboard projections, is provided for informational purposes only. You should consult a qualified financial adviser before making any investment decision. BizMarket is not responsible for any investment decisions you make based on information provided on the Platform.</p>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-2xl font-bold text-[#F9F9FB] mb-6">3. BizShares Instruments — Nature and Risk</h3>
                        <div className="space-y-4">
                            <h4 className="text-[#F9F9FB] font-bold mt-6 mb-3">3.1 What BizShares Are</h4>
                            <p>BizShares are on-chain digital instruments that represent economic rights tied to real-world assets and revenue streams. BizShares are NOT equity securities. They do not confer ownership in any business, voting rights, board representation, or any claim on the assets of any business in the event of liquidation or winding up.</p>
                            <p>The three classes of BizShares instruments are distinct in their underlying assets, risk profiles, and return structures:</p>
                            
                            <div className="pl-4 border-l-2 border-[#1E2F45] my-4 space-y-4">
                                <div>
                                    <strong className="text-[#F9F9FB] block mb-1">BizYield — Revenue Share Certificates</strong>
                                    <p>BizYield instruments represent a contractual entitlement to a percentage of a listed business's monthly gross revenue for a defined period. The revenue percentage is determined by the formula: (Investment Amount / Total Raise) x 100. BizYield returns are variable and directly dependent on the performance of the underlying business. BizMarket does not guarantee any minimum return on BizYield instruments.</p>
                                </div>
                                <div>
                                    <strong className="text-[#F9F9FB] block mb-1">BizCredit — Credit Yield Certificates</strong>
                                    <p>BizCredit instruments represent participation in BizMarket's private lending pool. Holders receive fixed weekly payments in stablecoins for a 12-week cycle, with principal returned at the end of the cycle. The fixed return is 4% per quarter (approximately 16% annualised). BizCredit returns depend on the health of BizMarket's loan portfolio and are not guaranteed by any government or insurance scheme.</p>
                                </div>
                                <div>
                                    <strong className="text-[#F9F9FB] block mb-1">BizBond — Fixed Income Certificates</strong>
                                    <p>BizBond instruments are backed by sovereign government securities including Nigerian Federal Government Treasury Bills, FGN Bonds, Savings Bonds, Sukuk, Infrastructure Bonds, and equivalent sovereign instruments. BizBond offers a fixed 10% annual return paid quarterly. While BizBond carries the lowest risk of the three instrument classes, sovereign risk and currency risk are not zero.</p>
                                </div>
                            </div>

                            <h4 className="text-[#F9F9FB] font-bold mt-8 mb-3">3.2 BizShares Are Not Equity</h4>
                            <p>Holding BizShares of any class does not make you a shareholder, part-owner, director, or creditor of any listed business or of BizMarket itself. Your BizShare Certificate records your economic entitlement to yield payments only. The underlying business retains 100% of its equity. BizMarket's private equity participation in listed businesses is for oversight and verification purposes on behalf of all instrument holders and does not create any ownership rights for holders.</p>

                            <h4 className="text-[#F9F9FB] font-bold mt-8 mb-3">3.3 Supply Caps and Instrument Cycles</h4>
                            <p>Each BizShares instrument cycle is subject to a maximum supply cap. For the inaugural cycle, each instrument class is capped at 1,000 units. Once a cap is reached, no further purchases can be made in that cycle. Caps are enforced on-chain and cannot be overridden. BizMarket may launch subsequent cycles with new terms at its sole discretion.</p>

                            <h4 className="text-[#F9F9FB] font-bold mt-8 mb-3">3.4 Vesting and Lock-Up Periods</h4>
                            <p>Certain instruments are subject to vesting periods during which certificates are non-transferable and yield payments do not commence:</p>
                            <ul className="list-disc pl-5 space-y-2 mt-2">
                                <li><strong className="text-[#F9F9FB]">BizYield:</strong> 3-month vesting period from date of purchase. Yield earning and trading commence on August 1, 2026 for the inaugural cycle.</li>
                                <li><strong className="text-[#F9F9FB]">BizBond:</strong> 3-month vesting period from date of purchase. Yield earning and trading commence on August 1, 2026 for the inaugural cycle.</li>
                                <li><strong className="text-[#F9F9FB]">BizCredit:</strong> No vesting period. Weekly payments commence June 15, 2026 for the inaugural cycle, regardless of purchase date prior to that date.</li>
                            </ul>
                            <p className="mt-4">During the vesting period, you may not transfer, sell, or trade your certificates. BizMarket enforces vesting lock-ups via on-chain token auth rules. Attempting to circumvent the vesting lock is a breach of these Terms.</p>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-2xl font-bold text-[#F9F9FB] mb-6">4. Purchases, Payments, and Fees</h3>
                        <div className="space-y-4">
                            <h4 className="text-[#F9F9FB] font-bold mt-6 mb-3">4.1 Accepted Payment Methods</h4>
                            <p>BizMarket accepts the following payment methods for instrument purchases via BizSwap:</p>
                            <ul className="list-disc pl-5 space-y-2 mt-2">
                                <li>cNGN (Nigerian Digital Naira stablecoin)</li>
                                <li>USDC (USD Coin stablecoin)</li>
                                <li>$BIZMART (BizMarket platform token)</li>
                                <li>NGN (Nigerian Naira via ChainRails fiat onramp)</li>
                                <li>Other tokens and currencies supported by ChainRails payment infrastructure from time to time</li>
                            </ul>

                            <h4 className="text-[#F9F9FB] font-bold mt-8 mb-3">4.2 Minimum Purchase Amounts</h4>
                            <p>The following minimum purchase amounts apply per transaction:</p>
                            <ul className="list-disc pl-5 space-y-2 mt-2">
                                <li>BizYield: USD $10 equivalent per certificate</li>
                                <li>BizCredit: USD $100 per unit (one unit = one BizCredit certificate)</li>
                                <li>BizBond: USD $1,000 per certificate</li>
                            </ul>
                            <p className="mt-2">Purchases below the minimum threshold will be rejected by the Platform. Minimum amounts are enforced at the point of transaction and cannot be waived.</p>

                            <h4 className="text-[#F9F9FB] font-bold mt-8 mb-3">4.3 Platform Fee</h4>
                            <p>BizMarket charges a 1% origination fee on all BizShares instrument purchases. This fee is additive, not deductive. The fee is calculated on the investment amount and charged in addition to it, in the same currency used for the purchase.</p>
                            <div className="bg-[#080E18] p-4 border border-[#1E2F45] my-4 font-mono text-sm text-[#81D7B4]">
                                The fee formula is: Total Charged = Investment Amount + (Investment Amount x 1%)
                            </div>
                            <p>Your BizShares entitlement is calculated on the investment amount only, not the gross amount charged. The 1% fee does not affect your yield entitlement, your revenue share percentage, your weekly payment amount, or your principal return amount.</p>
                            <p className="italic text-sm mt-2">Example: A purchase of $400 worth of BizYield results in a total charge of $404. The user receives BizYield entitlement calculated on $400.</p>

                            <h4 className="text-[#F9F9FB] font-bold mt-8 mb-3">4.4 Payment Finality</h4>
                            <p>All payments made on the BizMarket Platform are final and non-refundable once the transaction is confirmed on the blockchain. BizMarket does not offer refunds, chargebacks, or cancellations after a purchase is completed. By confirming a purchase, you acknowledge that blockchain transactions are irreversible and accept full responsibility for the transaction.</p>

                            <h4 className="text-[#F9F9FB] font-bold mt-8 mb-3">4.5 Price Calculations and Exchange Rates</h4>
                            <p>Where payment is made in a currency other than USD, the USD equivalent is calculated at the prevailing exchange rate at the time of transaction using BizMarket's oracle infrastructure. Exchange rates are sourced from Chainlink price feeds and ChainRails. BizMarket is not responsible for any losses arising from exchange rate fluctuations between the time you initiate a transaction and the time it is confirmed on-chain.</p>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-2xl font-bold text-[#F9F9FB] mb-6">5. Yield Payments and Distributions</h3>
                        <div className="space-y-4">
                            <h4 className="text-[#F9F9FB] font-bold mt-6 mb-3">5.1 Payment Schedule</h4>
                            <p>Yield payments are made according to the following schedules:</p>
                            <ul className="list-disc pl-5 space-y-2 mt-2">
                                <li><strong className="text-[#F9F9FB]">BizYield:</strong> Monthly distributions. Paid in cNGN or USDC to the holder's registered wallet. Distributions are made within 5 business days of month close following BizMarket's monthly revenue verification process.</li>
                                <li><strong className="text-[#F9F9FB]">BizCredit:</strong> Weekly payments every 7 days from June 15, 2026 for the inaugural cycle. Payment of $8.67 per unit per week for 12 consecutive weeks. Principal of $100 per unit returned at Week 12 alongside the final interest payment.</li>
                                <li><strong className="text-[#F9F9FB]">BizBond:</strong> Quarterly distributions. Four payments per year from August 1, 2026. Fixed payment of $25 per $1,000 unit per quarter.</li>
                            </ul>

                            <h4 className="text-[#F9F9FB] font-bold mt-8 mb-3">5.2 Payment Currency</h4>
                            <p>All yield payments on BizMarket are made exclusively in stablecoins. BizMarket does not pay yield in its native $BIZMART token or in any other volatile digital asset. Payments are made in cNGN or USDC based on the holder's preference as configured in their dashboard settings. BizMarket reserves the right to add additional stablecoin payment options at any time.</p>

                            <h4 className="text-[#F9F9FB] font-bold mt-8 mb-3">5.3 BizYield Revenue Calculations</h4>
                            <p>For BizYield instruments, monthly distributions are calculated as follows:</p>
                            <ol className="list-decimal pl-5 space-y-2 mt-2">
                                <li>BizMarket verifies the listed business's monthly gross revenue through its coordination layer, including review of bank statements, POS data, and management accounts to which BizMarket has access as a private equity stakeholder.</li>
                                <li>The verified revenue figure is used to calculate the distribution pool, which equals the agreed revenue share percentage of the verified monthly gross revenue.</li>
                                <li>Each holder's entitlement is calculated as: (Holder's Investment / Total Raise) x 100, expressed as a percentage of the distribution pool.</li>
                                <li>The distribution pool amount is converted from local currency to stablecoins via BizMarket's licensed FX conversion channels and deposited into the distribution smart contract.</li>
                                <li>The smart contract distributes proportionally to all vested holders based on their recorded entitlement percentages.</li>
                            </ol>

                            <h4 className="text-[#F9F9FB] font-bold mt-8 mb-3">5.4 No Guarantee of BizYield Returns</h4>
                            <p>BizYield returns are variable and not guaranteed. The amount you receive each month depends entirely on the revenue generated by the underlying business during that month. BizMarket does not top up, supplement, or guarantee any minimum BizYield distribution. If a business generates zero revenue in a given month, the distribution for that month will be zero. This is the nature of a high-risk revenue share instrument.</p>

                            <h4 className="text-[#F9F9FB] font-bold mt-8 mb-3">5.5 Reserve Fund</h4>
                            <p>BizMarket maintains a reserve fund to protect BizCredit holders against short-term disruptions in the loan portfolio. This reserve is not a guarantee of returns and does not cover losses arising from large-scale portfolio defaults. The reserve fund is maintained at BizMarket's sole discretion and its size and deployment are not disclosed publicly.</p>

                            <h4 className="text-[#F9F9FB] font-bold mt-8 mb-3">5.6 Tax Obligations</h4>
                            <p>You are solely responsible for determining and fulfilling any tax obligations arising from yield payments, capital gains, or any other returns you receive from BizShares instruments. BizMarket does not provide tax advice and does not withhold taxes on distributions unless required by applicable law. BizMarket recommends that you consult a qualified tax adviser in your jurisdiction.</p>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-2xl font-bold text-[#F9F9FB] mb-6">6. BizShare Certificates</h3>
                        <div className="space-y-4">
                            <h4 className="text-[#F9F9FB] font-bold mt-6 mb-3">6.1 Nature of Certificates</h4>
                            <p>Upon purchase, BizMarket issues you a BizShare Certificate on the blockchain. This certificate is an on-chain digital record that documents your economic entitlement to yield payments. BizShare Certificates are issued as NFTs (for BizYield and BizBond) or digital tokens (for BizCredit) depending on the instrument class.</p>
                            <p>Your BizShare Certificate is not a security, a share, an equity instrument, or a debt instrument issued by any listed business. It is a record of your contractual entitlement to distributions managed by BizMarket. The legal agreement underlying your entitlement is the Revenue Participation Agreement, Credit Participation Agreement, or Bond Participation Agreement held between BizMarket and the relevant counterparty.</p>

                            <h4 className="text-[#F9F9FB] font-bold mt-8 mb-3">6.2 Certificate Naming</h4>
                            <p>BizShare Certificates are named to reflect the instrument class and, for BizYield instruments, the underlying business:</p>
                            <ul className="list-disc pl-5 space-y-2 mt-2">
                                <li>BizYield instruments: Revenue Share Certificate — [Business Name] (e.g. Revenue Share Certificate — Shard)</li>
                                <li>BizCredit instruments: Credit Yield Certificate</li>
                                <li>BizBond instruments: Fixed Income Certificate</li>
                            </ul>
                            <p className="mt-2">The certificate name does not imply ownership of the named business. It identifies the revenue source against which your yield entitlement is measured.</p>

                            <h4 className="text-[#F9F9FB] font-bold mt-8 mb-3">6.3 Certificate Transferability</h4>
                            <p>Subject to vesting restrictions set out in Section 3.4, BizShare Certificates may be transferred between wallets within the BizMarket ecosystem via BizSwap. Certificates may not be transferred to external platforms, listed on third-party exchanges, or used as collateral outside of BizMarket's own BizLend protocol without BizMarket's prior written consent.</p>

                            <h4 className="text-[#F9F9FB] font-bold mt-8 mb-3">6.4 Lost or Inaccessible Wallets</h4>
                            <p>BizMarket has no ability to recover certificates from lost, stolen, or inaccessible wallets. You are solely responsible for the security of your blockchain wallet and private keys. BizMarket will not reissue certificates under any circumstances where the original certificate remains on-chain in a wallet you cannot access.</p>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-2xl font-bold text-[#F9F9FB] mb-6">7. BizLend — Stock-Collateralised Lending</h3>
                        <div className="space-y-4">
                            <h4 className="text-[#F9F9FB] font-bold mt-6 mb-3">7.1 BizLend Service</h4>
                            <p>BizLend is a separate lending protocol within the BizMarket ecosystem that allows users holding tokenized stock positions acquired through Stox to borrow cNGN stablecoins using those stock positions as collateral. BizLend operates independently of BizShares instruments. Participation in BizLend is subject to these Terms as well as any additional BizLend-specific terms published on the Platform.</p>

                            <h4 className="text-[#F9F9FB] font-bold mt-8 mb-3">7.2 Loan-to-Value and Liquidation</h4>
                            <p>The following parameters apply to all BizLend loans:</p>
                            <ul className="list-disc pl-5 space-y-2 mt-2">
                                <li><strong className="text-[#F9F9FB]">Maximum Loan-to-Value (LTV):</strong> 70% of collateral value at time of loan origination</li>
                                <li><strong className="text-[#F9F9FB]">Liquidation Threshold:</strong> 85% LTV. If the value of your collateral falls such that your outstanding loan equals 85% of your collateral value, your loan will be liquidated automatically.</li>
                                <li><strong className="text-[#F9F9FB]">Interest Rate:</strong> 1% to 2% per month on the outstanding loan balance, depending on the risk profile of the collateral asset</li>
                                <li><strong className="text-[#F9F9FB]">Origination Fee:</strong> 1% of borrowed amount, charged in cNGN at loan opening, additive to the borrowed amount</li>
                            </ul>

                            <h4 className="text-[#F9F9FB] font-bold mt-8 mb-3">7.3 Liquidation Risk</h4>
                            <p>Liquidation is automatic and irreversible. If your collateral value falls to the liquidation threshold, your collateral will be liquidated without further notice to you. You may lose some or all of your collateral in a liquidation event. It is your responsibility to monitor your loan health factor and top up collateral or repay your loan before the liquidation threshold is reached. BizMarket is not liable for losses arising from liquidation.</p>

                            <h4 className="text-[#F9F9FB] font-bold mt-8 mb-3">7.4 Oracle Dependency</h4>
                            <p>BizLend relies on oracle price feeds to determine collateral values and calculate loan health factors. These price feeds are sourced from Chainlink and other third-party providers. BizMarket does not guarantee the accuracy, timeliness, or availability of oracle price data. In the event of oracle failure or manipulation, BizMarket may pause new borrowing activity. BizMarket is not liable for losses arising from oracle failures, data delays, or price feed inaccuracies.</p>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-2xl font-bold text-[#F9F9FB] mb-6">8. Risk Disclosures</h3>
                        <p className="mb-4">Investing in BizShares instruments and using BizLend involves significant financial risk. You should not invest more than you can afford to lose. By using the Platform, you confirm that you understand and accept the following risks:</p>
                        <div className="grid sm:grid-cols-2 gap-6 mt-6">
                            <div className="bg-[#080E18] border border-[#1E2F45] p-6 hover:border-[#81D7B4] transition-colors duration-300">
                                <h4 className="text-[#F9F9FB] font-bold mb-3 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-[#81D7B4] rounded-full"></span>
                                    8.1 Market & Performance Risk
                                </h4>
                                <ul className="list-disc pl-5 space-y-2 text-sm">
                                    <li>BizYield returns are variable and may be lower than anticipated or zero if the underlying business underperforms or ceases operations.</li>
                                    <li>BizCredit returns depend on the health of BizMarket's loan portfolio. Widespread borrower default could impair payments.</li>
                                    <li>BizBond returns are subject to sovereign risk. Although low, the possibility of government default or restructuring exists.</li>
                                    <li>The market value of BizShare Certificates on BizSwap may be higher or lower than your purchase price at any given time.</li>
                                </ul>
                            </div>
                            <div className="bg-[#080E18] border border-[#1E2F45] p-6 hover:border-[#81D7B4] transition-colors duration-300">
                                <h4 className="text-[#F9F9FB] font-bold mb-3 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-[#81D7B4] rounded-full"></span>
                                    8.2 Tech & Smart Contract Risk
                                </h4>
                                <ul className="list-disc pl-5 space-y-2 text-sm">
                                    <li>Smart contracts are immutable once deployed. Bugs, exploits, or vulnerabilities in the code could result in loss of funds.</li>
                                    <li>Blockchain networks including Solana may experience outages, congestion, forks, or other disruptions.</li>
                                    <li>You are solely responsible for the security of your wallet. Phishing attacks, malware, and compromised private keys are risks you must manage independently.</li>
                                </ul>
                            </div>
                            <div className="bg-[#080E18] border border-[#1E2F45] p-6 hover:border-[#81D7B4] transition-colors duration-300">
                                <h4 className="text-[#F9F9FB] font-bold mb-3 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-[#81D7B4] rounded-full"></span>
                                    8.3 Liquidity & Regulatory Risk
                                </h4>
                                <ul className="list-disc pl-5 space-y-2 text-sm">
                                    <li>BizShare Certificates may not always have a liquid secondary market on BizSwap.</li>
                                    <li>During vesting periods, certificates are completely illiquid.</li>
                                    <li>Changes in laws or regulations in Nigeria or any other jurisdiction may affect BizMarket's ability to operate.</li>
                                </ul>
                            </div>
                            <div className="bg-[#080E18] border border-[#1E2F45] p-6 hover:border-[#81D7B4] transition-colors duration-300">
                                <h4 className="text-[#F9F9FB] font-bold mb-3 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-[#81D7B4] rounded-full"></span>
                                    8.4 Counterparty & FX Risk
                                </h4>
                                <ul className="list-disc pl-5 space-y-2 text-sm">
                                    <li>cNGN-denominated returns are subject to naira inflation and devaluation risk.</li>
                                    <li>BizYield instruments depend on the continued operation and cooperation of the listed business. Business failure or fraud are risks that BizMarket mitigates but cannot eliminate entirely.</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-2xl font-bold text-[#F9F9FB] mb-6">9. BizMarket Coordination Layer and Oversight</h3>
                        <div className="space-y-4">
                            <h4 className="text-[#F9F9FB] font-bold mt-6 mb-3">9.1 Private Equity Participation</h4>
                            <p>For all BizYield instruments, BizMarket's associated private equity entity holds a direct stake in the listed business as part of the onboarding process. This participation grants BizMarket access to the business's financial records, management accounts, and operational data on a monthly basis. This access is used exclusively for the purpose of verifying revenue figures for distribution calculations. It does not transfer any ownership rights to BizShare Certificate holders.</p>

                            <h4 className="text-[#F9F9FB] font-bold mt-8 mb-3">9.2 Business Viability Assessment</h4>
                            <p>Before any business is listed under BizYield, BizMarket conducts a multi-factor assessment covering revenue history, business model sustainability, product quality, foot traffic and demand data, management track record, ownership and legal structure, existing debt obligations, revenue concentration risk, and growth trajectory. The completion of this assessment does not constitute a warranty of business performance or a guarantee of returns.</p>

                            <h4 className="text-[#F9F9FB] font-bold mt-8 mb-3">9.3 On-Chain and Off-Chain Value Alignment</h4>
                            <p>BizMarket is committed to ensuring that the value represented on-chain by BizShare Certificates reflects real-world economic activity. BizMarket achieves this through monthly revenue verification, independent reconciliation of business bank records, licensed FX conversion channels, and transparent on-chain smart contract distribution. However, BizMarket cannot guarantee perfect real-time alignment between on-chain representations and off-chain economic reality at all times.</p>

                            <h4 className="text-[#F9F9FB] font-bold mt-8 mb-3">9.4 BizBond Custody and Reserve Verification</h4>
                            <p>Government securities backing BizBond instruments are purchased through licensed primary dealers and authorised stockbrokers registered with the Securities and Exchange Commission (SEC) Nigeria. Custodial receipts are held in segregated accounts separate from BizMarket's operational treasury. BizBond reserve details are published on BizMarket's transparency dashboard. Securities held in custody for BizBond holders cannot be used for any other purpose by BizMarket.</p>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-2xl font-bold text-[#F9F9FB] mb-6">10. User Obligations and Prohibited Conduct</h3>
                        <div className="space-y-4">
                            <h4 className="text-[#F9F9FB] font-bold mt-6 mb-3">10.1 Your Obligations</h4>
                            <p>By using the Platform, you agree to:</p>
                            <ul className="list-disc pl-5 space-y-2 mt-2">
                                <li>Provide accurate information when setting up your account or wallet profile</li>
                                <li>Comply with all applicable laws and regulations in your jurisdiction</li>
                                <li>Maintain the security of your wallet and private keys</li>
                                <li>Not attempt to manipulate, exploit, or abuse the Platform or its smart contracts</li>
                                <li>Not use the Platform to facilitate money laundering, terrorist financing, fraud, or any other illegal activity</li>
                                <li>Promptly notify BizMarket at legal@bizmarket.io if you become aware of any security breach, vulnerability, or suspicious activity on the Platform</li>
                            </ul>

                            <h4 className="text-[#F9F9FB] font-bold mt-8 mb-3">10.2 Prohibited Conduct</h4>
                            <p>You must not:</p>
                            <ul className="list-disc pl-5 space-y-2 mt-2">
                                <li>Use automated bots, scripts, or tools to interact with the Platform in a manner that disrupts normal operation</li>
                                <li>Attempt to reverse engineer, decompile, or extract source code from BizMarket's smart contracts or software beyond what is publicly available on-chain</li>
                                <li>Create multiple accounts to circumvent purchase caps, eligibility criteria, or any other restriction</li>
                                <li>Misrepresent your identity, jurisdiction, or eligibility to use the Platform</li>
                                <li>Engage in wash trading, market manipulation, or any activity designed to artificially influence the price of BizShare Certificates on BizSwap</li>
                                <li>Transfer certificates in violation of vesting lock-up restrictions</li>
                            </ul>
                            <p className="mt-4 text-[#81D7B4]">Violation of these obligations may result in suspension or permanent termination of your access to the Platform, forfeiture of pending yield payments, and where applicable, referral to relevant law enforcement authorities.</p>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-2xl font-bold text-[#F9F9FB] mb-6">11. Intellectual Property</h3>
                        <p>All content, trademarks, logos, software, smart contract code, interface designs, and documentation on the BizMarket Platform are the intellectual property of BizMarket or its licensors. The BizMarket name, BizSwap, BizShares, BizYield, BizCredit, BizBond, and BizLend are trademarks of BizMarket.</p>
                        <p className="mt-4">You are granted a limited, non-exclusive, non-transferable licence to access and use the Platform for your personal investment purposes only. You may not reproduce, distribute, modify, create derivative works from, or commercially exploit any BizMarket intellectual property without prior written consent.</p>
                    </section>

                    <section>
                        <h3 className="text-2xl font-bold text-[#F9F9FB] mb-6">12. Limitation of Liability and Disclaimers</h3>
                        <div className="space-y-4">
                            <h4 className="text-[#F9F9FB] font-bold mt-6 mb-3">12.1 Platform Provided As-Is</h4>
                            <p>The BizMarket Platform is provided on an "as is" and "as available" basis without warranties of any kind, whether express or implied. BizMarket does not warrant that the Platform will be uninterrupted, error-free, secure, or free of viruses or other harmful components. BizMarket expressly disclaims all implied warranties of merchantability, fitness for a particular purpose, and non-infringement.</p>

                            <h4 className="text-[#F9F9FB] font-bold mt-8 mb-3">12.2 Limitation of Liability</h4>
                            <p>To the fullest extent permitted by applicable law, BizMarket and its directors, officers, employees, contractors, affiliates, and agents shall not be liable for:</p>
                            <ul className="list-disc pl-5 space-y-2 mt-2">
                                <li>Any loss of principal, loss of yield, or loss of anticipated profits arising from your use of BizShares instruments</li>
                                <li>Any loss arising from smart contract vulnerabilities, blockchain outages, oracle failures, or network congestion</li>
                                <li>Any loss arising from your failure to maintain the security of your wallet or private keys</li>
                                <li>Any indirect, incidental, special, consequential, or punitive damages of any kind</li>
                                <li>Any loss arising from regulatory changes that affect your ability to hold or transfer BizShare Certificates</li>
                                <li>Any loss arising from the failure, insolvency, or fraud of any listed business</li>
                            </ul>

                            <h4 className="text-[#F9F9FB] font-bold mt-8 mb-3">12.3 No Financial Advice Disclaimer</h4>
                            <p>BizMarket is not a licensed financial institution, investment adviser, broker, or asset manager in any jurisdiction. Nothing on the Platform constitutes a recommendation to buy, sell, or hold any financial instrument. Past performance data displayed on the Platform is historical and not indicative of future results. All investment decisions are made at your sole discretion and risk.</p>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-2xl font-bold text-[#F9F9FB] mb-6">13. Privacy and Data</h3>
                        <p>BizMarket collects and processes data in connection with your use of the Platform including wallet addresses, transaction data, and any personal information you voluntarily provide. Because BizMarket operates on a public blockchain, transaction data including wallet addresses, certificate mints, and distribution records are publicly visible on the blockchain. You acknowledge and accept this inherent characteristic of public blockchain technology.</p>
                        <p className="mt-4">BizMarket's Privacy Policy, available at <span className="text-[#F9F9FB]">bizmarket.io/privacy</span>, governs the collection, use, storage, and disclosure of any personal data you provide off-chain. By using the Platform, you consent to the data practices described in the Privacy Policy.</p>
                    </section>

                    <section>
                        <h3 className="text-2xl font-bold text-[#F9F9FB] mb-6">14. Amendments and Updates</h3>
                        <p>BizMarket reserves the right to amend, update, or replace these Terms at any time. When material changes are made, BizMarket will notify users through the Platform interface, by email where an email address has been provided, or by posting an updated version at <span className="text-[#F9F9FB]">bizmarket.io/terms</span> with a new effective date.</p>
                        <p className="mt-4">Your continued use of the Platform after the effective date of any updated Terms constitutes your acceptance of the revised Terms. If you do not agree to the revised Terms, you must stop using the Platform. BizMarket is not obligated to honour prior terms for instruments purchased before an update, except where such instruments have legally binding terms that would be affected by the change, in which case the original terms continue to govern those specific instruments.</p>
                    </section>

                    <section>
                        <h3 className="text-2xl font-bold text-[#F9F9FB] mb-6">15. Governing Law and Dispute Resolution</h3>
                        <div className="space-y-4">
                            <h4 className="text-[#F9F9FB] font-bold mt-6 mb-3">15.1 Governing Law</h4>
                            <p>These Terms are governed by and construed in accordance with the laws of the Federal Republic of Nigeria, without regard to its conflict of law provisions. For users accessing the Platform from other jurisdictions, local mandatory consumer protection laws may also apply.</p>

                            <h4 className="text-[#F9F9FB] font-bold mt-8 mb-3">15.2 Dispute Resolution</h4>
                            <p>In the event of any dispute arising from or in connection with these Terms or your use of the Platform, the parties shall first attempt to resolve the dispute through good faith negotiation. If the dispute is not resolved within 30 days of written notice by either party, the dispute shall be referred to binding arbitration in accordance with the Arbitration and Conciliation Act of Nigeria. The place of arbitration shall be Lagos, Nigeria. The language of arbitration shall be English.</p>

                            <h4 className="text-[#F9F9FB] font-bold mt-8 mb-3">15.3 Class Action Waiver</h4>
                            <p>You waive any right to bring or participate in any class action, collective action, or representative proceeding against BizMarket. All disputes must be brought on an individual basis only.</p>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-2xl font-bold text-[#F9F9FB] mb-6">16. General Provisions</h3>
                        <div className="space-y-4">
                            <h4 className="text-[#F9F9FB] font-bold mt-6 mb-3">16.1 Entire Agreement</h4>
                            <p>These Terms, together with the Privacy Policy and any instrument-specific disclosure documents, constitute the entire agreement between you and BizMarket with respect to your use of the Platform and supersede all prior agreements, representations, and understandings.</p>

                            <h4 className="text-[#F9F9FB] font-bold mt-8 mb-3">16.2 Severability</h4>
                            <p>If any provision of these Terms is found to be invalid, illegal, or unenforceable by a court of competent jurisdiction, that provision shall be modified to the minimum extent necessary to make it enforceable, or if modification is not possible, severed from these Terms. The remaining provisions shall continue in full force and effect.</p>

                            <h4 className="text-[#F9F9FB] font-bold mt-8 mb-3">16.3 Waiver</h4>
                            <p>BizMarket's failure to enforce any provision of these Terms on any occasion does not constitute a waiver of its right to enforce that provision on any other occasion.</p>

                            <h4 className="text-[#F9F9FB] font-bold mt-8 mb-3">16.4 Assignment</h4>
                            <p>You may not assign or transfer your rights or obligations under these Terms without BizMarket's prior written consent. BizMarket may assign these Terms or any rights herein to any affiliate, successor, or acquirer without your consent.</p>
                        </div>
                    </section>

                    <div className="mt-16 pt-8 border-t border-[#1E2F45] text-sm text-[#7B8B9A] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <p className="font-bold uppercase tracking-wide text-[#F9F9FB] mb-1">BizMarket Protocol</p>
                            <p>Terms and Conditions · Version 1.0</p>
                        </div>
                        <div className="flex flex-col sm:items-end gap-1">
                            <p>Effective June 5, 2026</p>
                            <p>These Terms are subject to change. Always review before transacting.</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

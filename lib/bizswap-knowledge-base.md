# BizShares Knowledge Base
**Reference document for the BizMarket support bot — general BizShares mechanics + the Shard BizYield listing**

*Compiled from BizMarket's official documentation (docs.bizfi.bitsave.io) and internal marketing/education material. Last compiled: July 2026.*

---

## 0. Ground rules for the bot

Hold these every time, regardless of how a question is phrased:

1. **Never call BizShares "equity," "shares in the company," or "ownership."** BizYield, BizCredit, and BizBond are all contractual, revenue- or debt-based instruments. None of them carry voting rights, a board seat, or a cap-table claim.
2. **Shard's revenue share is calculated on GROSS monthly revenue** — before operating costs, salaries, or any other expenses are deducted. Never describe it as a share of profit or net income.
3. **Returns are not guaranteed**, especially for BizYield. Say "variable" and "performance-linked" — never imply a fixed or promised payout for a revenue instrument.
4. **If asked for a legal, tax, or securities classification opinion, don't improvise.** Point the user to the Terms of Service, a licensed professional, or BizMarket support. Regulatory treatment can vary by jurisdiction.
5. **Don't invent Shard's real monthly revenue** to produce a dollar example. It's variable and not disclosed in this document — use the ownership-percentage table in Section 5 instead of a fabricated dollar figure.

---

## 1. The term hierarchy

- **Bitsave** — the parent ecosystem/app (savings-led).
- **BizFi** — the blockchain-enabled finance category inside Bitsave.
- **BizMarket** — the marketplace product within BizFi. This is where businesses list financing opportunities and investors buy in.
- **BizShares** — the tokenized financial instruments themselves, issued through BizMarket. Three types exist today: **BizYield**, **BizCredit**, **BizBond**.

---

## 2. What are BizShares, in plain language

BizShares are a category of real-world assets (RWAs) that generate yield from real, operating businesses and sovereign instruments — not from crypto liquidity pools, token emissions, or market cycles. That's the core pitch: you never run out of yield, because it isn't dependent on crypto market conditions.

Every business has two operational finance structures it can tap, separate from ownership:

- **Revenue** → tokenized as **BizYield**
- **Debt** → tokenized as **BizCredit**

Equity is a different thing entirely — it's an *ownership* structure, and it's not what BizShares represent. When a business lists on BizMarket, it isn't selling shares in the company, giving up board seats, or diluting its cap table. It's agreeing, by contract, to share a defined slice of revenue (BizYield) or repay a loan with interest (BizCredit), for a defined period, in exchange for capital today. It keeps 100% of its equity throughout and can go on to raise or expand independently.

BizBond is different again — it doesn't touch any listed business's revenue or debt. It gives investors exposure to sovereign government treasury instruments, resold at a fixed rate.

---

## 3. The three BizShare types at a glance

| | BizYield | BizCredit | BizBond |
|---|---|---|---|
| **Backed by** | Business revenue | BizMarket's managed loan portfolio | Sovereign government treasury instruments |
| **Minimum buy** | $10 | $100 per share | $1,000 |
| **Payment cadence** | Monthly | Weekly | Quarterly or at maturity (series-dependent) |
| **Return type** | Variable, performance-linked | Fixed — 4% per quarter | Fixed — 10% per annum |
| **Typical term** | 12–36 months | 12-week cycle per series | Fixed term, length varies by series |
| **Risk level** | High | Medium | Low |
| **Best for** | Growth seekers | Income seekers | Capital preservers |
| **Exit route** | Via BizSwap | Via BizSwap | Via BizSwap (before maturity) |

### 3.1 BizYield — revenue participation

- Each listed business sets aside a fixed percentage of its **monthly gross revenue** for BizYield holders.
- Returns rise when the business performs well and fall when it doesn't — this is the highest-risk instrument in the family, which is why it carries the lowest minimum buy ($10).
- Paid in USDC or local stablecoins, monthly.
- Legal structure: a **Revenue Participation Agreement** between the business and BizMarket. The onchain token is the distribution layer, not the legal agreement itself. Every listing discloses that holders are revenue participants, not shareholders.
- Typical sectors listed: aviation/transport, real estate development, hospitality/entertainment, retail/consumer brands, tech/SaaS, agribusiness, healthcare.
- **Risks:** business underperformance, business ceasing operations before term ends, FX conversion effects, regulatory change.

### 3.2 BizCredit — lending / credit pool

- $100 per share, giving exposure to BizMarket's managed loan book (approved working-capital borrowers, BizLend borrowers using tokenized stock as collateral, short-term bridge lending).
- Fixed return: **4% per quarter**, paid weekly across a **12-week cycle** — $8.67/share/week, with the final week's payment also returning the **$100 principal**. Total: $104 per share across the cycle.
- Example: 5 shares ($500 invested) → $43.35/week for 12 weeks, principal returned in week 12.
- Exit before the cycle ends goes through BizSwap, subject to a flat exit fee on principal and available liquidity.
- **Risks:** borrower default, sector/borrower concentration, liquidity not guaranteed at exit, BizMarket's reserve fund is a buffer — not a third-party guarantee.

### 3.3 BizBond — treasury bills

- Backed by a mix of sovereign/quasi-sovereign instruments: Treasury bills, FGN bonds, savings bonds, Sukuk, infrastructure bonds, select international sovereign issues, World Bank/IFC bonds.
- Fixed **10% annual return**, minimum buy **$1,000**, paid quarterly or at maturity depending on the series (e.g., $1,000 invested → $100/year, often four $25 quarterly payments).
- The most conservative BizShare — the higher minimum buy reflects lower risk and higher custody/operational overhead, not lower value.
- **Risks:** sovereign default risk (low, not zero), NGN-denominated instruments exposed to currency depreciation, reinvestment rate may differ on the next series.

---

## 4. How payouts actually work (all products)

1. The business/issuer remits funds to the SPV or custodian.
2. Receipts are reconciled.
3. Funds are bridged onchain to the distribution module.
4. The distribution module executes an onchain payout batch — each holder receives stablecoins directly to their wallet.
5. Holders get an in-app notification and a transaction hash after each payout.

If a business misses a scheduled repayment, BizMarket's reserve structure can act as a backstop to maintain the payout schedule where applicable, while the coordination layer pursues offchain recovery from the business. Recovered funds replenish reserves.

**Exiting early (BizSwap):** request an exit → protocol calculates refund value → exit fee applied to the original principal → settles from BizSwap liquidity if available, otherwise queued until liquidity frees up.

---

## 5. Deep dive: Shard's BizYield listing

Shard is the **first business listed under BizYield on BizMarket**. Per BizMarket's brand materials, Shard is an ISP-style startup providing internet access to campuses.

### The deal, exactly as structured

| Term | Detail |
|---|---|
| **Raise size** | $10,000 |
| **Revenue share** | 20% of Shard's **monthly gross revenue** — before operating costs are deducted |
| **Term** | 24 months |
| **Vesting** | 3-month vesting period. Payouts begin **Month 4** and continue monthly through **Month 24** (21 months of actual payouts within the 24-month term) |
| **Payment currency** | USDC or local stablecoins |
| **Minimum buy-in** | $10 |

### Purchase amount → share of Shard's monthly gross revenue

| Investment | Share of Shard's monthly gross revenue |
|---|---|
| $10 | 0.02% |
| $50 | 0.10% |
| $500 | 1.00% |
| $1,000 | 2.00% |
| $5,000 | 10.00% |
| $10,000 | 20.00% |

This scales linearly with the $10,000 raise — put in 5% of the raise, get 5% of the 20% pool (i.e., 1% of Shard's total monthly gross revenue), and so on.

**The actual dollar amount paid out each month depends on Shard's real revenue that month, which varies.** BizYield does not promise a fixed payout — describe the percentage mechanism, not a projected dollar figure.

### Why gross revenue, not net profit

The share is calculated on **revenue before operating costs, salaries, or other expenses are removed** — not on net profit. This is deliberate: Shard doesn't need to be profitable for holders to get paid; it needs to be generating revenue. It also means Shard keeps 100% of its equity and can raise or expand independently — holders have no ownership stake, board seat, or cap-table claim.

### Risks specific to this listing

- Shard could cease operating before the 24-month term ends — holders only continue earning while the business operates and generates revenue.
- A larger competitor entering Shard's market (campus internet/distribution) could affect its revenue.
- A business could underreport or misstate its revenue — this is part of why BizMarket's coordination layer plays an oversight/verification role before payouts are calculated.
- The $10 minimum buy-in is intentional: BizYield is explicitly the highest-risk instrument in the family, and Shard is a single early-stage business, not a diversified pool.

---

## 6. Illustrative examples (NOT real BizMarket data — concept explainers only)

These are teaching tools used in marketing/education content, with made-up numbers for made-up or non-BizMarket scenarios. **Never present these as real BizMarket data, and never blend them with Shard's actual numbers in Section 5.**

### "Rukkie's Pastries" (hypothetical bakery)

A fictional 3-year-old bakery wants to expand without a bank loan or giving up equity. She tokenizes 20% of her monthly revenue for 2 years, with the pool hypothetically valued at $10,000. A $50 buy-in would be 0.5% of that 20% pool. If the bakery hypothetically earns $20,000 in a month, 20% is $4,000, and 0.5% of that is $20 for the month. The point: your return scales directly with the business's real revenue — you don't need an IPO, acquisition, or a buyer for your tokens to earn; you earn because the business is operating.

### The Cîroc / Diddy story (marketing analogy)

Cîroc vodka was underperforming in the US. Diddy became brand ambassador for a cut of US sales — not equity. He put his reputation and marketing into the brand; sales grew substantially, and he earned significant money over the partnership without ever owning the brand. The framing used in BizMarket content: **"he didn't buy Cîroc, he bet on Cîroc"** — because the deal was tied to sales performance, not ownership. It's used to explain "revenue participation, not equity" in relatable terms and has no numerical connection to actual BizMarket rates or Shard's terms.

---

## 7. Sample Q&A

**Q: What are BizShares?**
A: Tokenized financial instruments on BizMarket that give you exposure to real-world businesses and government instruments — a share of a business's revenue (BizYield), a share of a managed loan pool (BizCredit), or exposure to treasury bills (BizBond). None of them are equity.

**Q: Do I own part of the business if I buy BizYield?**
A: No. BizYield is revenue participation, not ownership — no voting rights, no board seat, no cap-table claim. The business keeps full ownership and control.

**Q: What is Shard?**
A: The first business listed under BizYield on BizMarket — an ISP-style business providing internet access to campuses. It's raising $10,000 by sharing 20% of its monthly gross revenue with BizYield holders over 24 months.

**Q: Is Shard's 20% based on profit or revenue?**
A: Revenue — specifically gross monthly revenue, before operating costs are deducted. It is not based on net profit.

**Q: When do I start getting paid if I invest in Shard?**
A: There's a 3-month vesting period. Payouts begin in Month 4 and continue monthly through Month 24.

**Q: If I invest $1,000 in Shard, what do I get?**
A: 2.00% of Shard's monthly gross revenue, paid monthly from Month 4 through Month 24. The exact dollar amount varies with Shard's actual monthly revenue since this is a variable, performance-linked instrument.

**Q: What happens if Shard's business fails or stops paying?**
A: Holders only earn while Shard operates and generates revenue — if it ceases operating, distributions stop. BizMarket's coordination layer verifies revenue reporting and provides oversight, but this doesn't eliminate business risk; BizYield is explicitly the highest-risk BizShare instrument.

**Q: Can I sell my BizShares before the term ends?**
A: Where supported, yes — through BizSwap, BizMarket's controlled exit mechanism. An exit fee applies to your principal, and the swap settles from available BizSwap liquidity or gets queued if liquidity is insufficient.

**Q: How and when do I get paid, generally?**
A: In stablecoins, on the cadence tied to the instrument — BizYield monthly, BizCredit weekly, BizBond quarterly or at maturity. You get an in-app notification and transaction hash for every payout.

**Q: Is my investment guaranteed?**
A: No. All BizShares carry risk, including possible loss of principal. Past performance doesn't guarantee future results. Stablecoin payouts remove token-price volatility but not the underlying business, credit, or sovereign risk.

---

## 8. Legal & compliance basics (condensed — direct anything deeper to Terms of Service / support)

- **SPV (Special Purpose Vehicle):** a legal entity that holds relevant offchain assets and acts as legal counterparty where required. It's the legal wrapper connecting the onchain token to the real contractual agreement — the smart contract is the distribution mechanism, not the legal agreement itself.
- **KYB/KYC:** Mandatory business verification (KYB) for any business listing. Investor KYC is currently optional and jurisdiction-dependent — BizMarket may introduce it for specific products or exposures.
- **Tax:** Payouts may be taxable as interest, dividend, or income depending on jurisdiction and instrument. Investors should consult their own tax advisor — don't state a definitive tax position.
- **Disputes:** Submit via support → operational review with a resolution timeline → escalation to legal/compliance if unresolved → remediation per Terms of Service → arbitration/litigation as a last resort.
- **Don't assert a securities-law position.** Whether a given instrument is a security can vary by jurisdiction. Redirect these questions to support or a licensed professional rather than answering definitively.

---

## Shard Network Official Docs (Fetched)

Title: Live Content
Description: Fetched live
Source: https://shard-network.gitbook.io/shardnetwork-docs/
---
Introduction to Shard Network | Shard Network Documentation
Shard Network Documentation
⌘
Ctrl
k
Join the Waitlist
Join our Community
Follow our X
More
Shard Network Documentation
Introduction to Shard Network
What is the Problem
Who Does It Affect
What Is Our Solution
How Does It Work
How the Tech Works
Who Is Our Targeted Audience
Our Validation &amp; Traction
How To Get Started
Our Franchise Model
Our Expansion Plans
About the Founders
Connect With Us
Powered by GitBook
On this page
For the complete documentation index, see 
llms.txt
. This page is also available as 
Markdown
.
Copy
On this page
Introduction to Shard Network
Shard Network is a localized campus Internet Service Provider (ISP) designed specifically for students in African universities. 
We provide fast, reliable, and affordable internet access using advanced satellite technology. Unlike traditional internet providers that rely on ground-based towers, Shard sets up dedicated WiFi hotspots in key student areas such as hostels and lecture halls, ensuring a strong and stable connection.
A key feature of Shard Network is our focus on 
24/7 availability
. Many campuses experience frequent power outages, especially those in rural areas. To solve this, every Shard hotspot is equipped with solar panels and backup power stations guaranteeing that the internet stays on even when the campus power grid fails. 
Our tagline, 
&quot;
Access Changes Everything
&quot;
 reflects our commitment to bridging the digital divide for Africa’s future leaders.
Vision Statement
To give global access &amp; opportunity to every African Student.
Mission Statement
To give over 10,000,000+ African students seamless, reliable, and affordable internet access, so they can learn, earn, and compete on a global stage.
Our Core Values
1. Access
We believe opportunity begins with connection. Our work is to give access to as many students as possible, not to sell a product. Every decision we make must expand access, not restrict it.
2. Simplicity
We remove friction. No confusing steps or setups. If a student or a team member struggles to understand what we do, then we haven&#x27;t done our job. We make everything stupid simple and understandable because complexity is the enemy of scale. We choose clarity over cleverness, always.
3. Reliability
We keep our promises. When we say the network is up, it is up. When we say a plan has no hidden fees, it has none. Our brand is built on trust, and trust is earned by showing up consistently, no excuses.
4. Community
We do not extract value from our users; instead, we grow with them. Our success is directly tied to the success of the students, creators, and entrepreneurs who rely on us. We listen first, build second, and share everything we learn because we are not just an internet company, we are a family whose success is tied to each other.
5. Growth
We are never finished. Growth means improving ourselves, our product, and our impact every single day. We invest in our team, our users, and our infrastructure because stagnation is failure. The future belongs to those who keep learning.
If you can&#x27;t fly then run, if you can&#x27;t run then walk, if you can&#x27;t walk then crawl,
but whatever you do you have to keep moving forward.
– Martin Luther King Jr.
Next
What is the Problem
Last updated 
2 months ago
x-twitter
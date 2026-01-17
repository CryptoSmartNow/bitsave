# 🪙 Bitsave

<div align="center">
  <strong>The Future of Decentralized Savings</strong>
  
  A modern, secure, and user-friendly SaveFi platform built on multiple blockchain networks.

  [![Next.js](https://img.shields.io/badge/Next.js-15.2.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19.0.0-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![Ethers.js](https://img.shields.io/badge/Ethers.js-6.15.0-blue?style=for-the-badge&logo=ethereum)](https://ethers.org/)

</div>

## 🎯 Overview

Bitsave is a cutting-edge savings finance (SaveFi) application that enables users to create secure, time-locked savings plans across multiple blockchain networks. Built with modern web technologies and smart contract integration, Bitsave offers a seamless experience for managing digital assets with built-in security features and penalty mechanisms.

### 🚀 Key Features

- 🔐 **Secure Time-Locked Savings** - Create savings plans with customizable maturity dates
- 🌐 **Multi-Chain Support** - Base, Celo, and Lisk networks
- 💰 **Multiple Cryptocurrencies** - USDC, ETH, cUSD, and more
- 🎯 **Penalty System** - Configurable early withdrawal penalties (5%, 10%, 15%, 20%)
- 📊 **Real-Time Analytics** - Track your savings performance and growth
- 🔄 **Top-Up Functionality** - Add funds to existing savings plans
- 👥 **Referral System** - Earn rewards by inviting friends
- 🌍 **Internationalization** - Support for 15+ languages
- 📱 **Responsive Design** - Optimized for desktop and mobile devices
- 🔒 **ENS Integration** - Link your Ethereum Name Service domains

## 🏗️ Architecture

### Frontend Stack
- **Framework**: Next.js 15.2.2 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom components
- **Animations**: Framer Motion
- **State Management**: React Query (TanStack Query)
- **Web3 Integration**: Wagmi + RainbowKit + Ethers.js

### Backend & Infrastructure
- **Database**: MongoDB with optimized queries
- **Authentication**: JWT-based admin authentication
- **Email Service**: Nodemailer with SMTP
- **Image Storage**: Cloudinary integration
- **Analytics**: Custom interaction tracking
- **Deployment**: Vercel-optimized

### Blockchain Integration
- **Smart Contracts**: Custom Bitsave contracts on multiple chains
- **Wallet Support**: MetaMask, WalletConnect, and more via RainbowKit
- **Networks**: Base, Celo, Lisk
- **Token Standards**: ERC-20 token support





## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Proxy Server
npm run proxy        # Start the dedicated proxy server (default port 3001)

# Database
node scripts/migrate-to-mongodb.js  # Migrate data to MongoDB
```

## 🛡️ Proxy Solution (ISP Bypass)

This project includes a robust proxy solution to bypass ISP restrictions on Coinbase and other RPC endpoints.

### 1. Integrated Next.js Proxy (Recommended)
The application automatically routes blocked domains through `/api/coinbase-proxy`. This works out-of-the-box when deployed to Vercel or any cloud provider not blocked by your ISP.
- **Enabled by default**: See `app/providers.tsx` (`USE_PROXY = true`).
- **Features**: Automatic retries, domain whitelisting, and global fetch interception for SDKs.

### 2. Standalone Proxy Server
If you need a dedicated proxy server (e.g., for local development or separate hosting):
1. Run `npm run proxy`.
2. The proxy will start on `http://localhost:3001` (or set `PORT` env var).
3. Configure your client to point to this proxy server.

## 🌐 Supported Networks & Tokens

### Networks
- **Base** - Ethereum Layer 2 solution
- **Celo** - Mobile-first blockchain platform  
- **Lisk** - Accessible blockchain application platform

### Supported Tokens
| Network | Tokens |
|---------|--------|
| Base    | USDC, ETH |
| Celo    | cUSD, CELO |
| Lisk    | USDC, ETH |

## 🔐 Smart Contract Integration

### Contract Addresses
- **Base**: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- **Celo**: `0x7d839923Eb2DAc3A0d1cABb270102E481A208F33`
- **Lisk**: `0x3593546078eECD0FFd1c19317f53ee565be6ca13`

### Key Functions
- `createSaving()` - Create new savings plan
- `joinBitsave()` - Register user with platform
- `topUpSaving()` - Add funds to existing plan
- `withdrawSaving()` - Withdraw from matured plan
- `getUserChildContractAddress()` - Get user's contract address

## 🎨 UI/UX Features

- **Modern Design**: Clean, intuitive interface with smooth animations
- **Dark/Light Mode**: Automatic theme switching support
- **Responsive Layout**: Optimized for all device sizes
- **Accessibility**: WCAG compliant with keyboard navigation
- **Loading States**: Skeleton loaders and progress indicators
- **Error Handling**: User-friendly error messages and recovery options

## 🌍 Internationalization

Bitsave supports 15+ languages:
- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Italian (it)
- Portuguese (pt)
- Dutch (nl)
- Russian (ru)
- Japanese (ja)
- Korean (ko)
- Chinese (zh)
- Hindi (hi)
- Arabic (ar)
- Turkish (tr)
- Swedish (sv)

## 📊 Analytics & Tracking

- **User Interactions**: Track user behavior and engagement
- **Transaction Monitoring**: Real-time transaction status tracking
- **Performance Metrics**: Dashboard analytics and insights
- **Error Tracking**: Comprehensive error logging and reporting

## 🔒 Security Features

- **Smart Contract Audits**: Thoroughly tested contract code
- **Secure Authentication**: JWT-based admin authentication
- **Input Validation**: Comprehensive form validation
- **Rate Limiting**: API rate limiting protection
- **HTTPS Enforcement**: Secure data transmission
- **Environment Variables**: Sensitive data protection

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing React framework
- **Ethereum Foundation** - For blockchain infrastructure
- **RainbowKit** - For seamless wallet integration
- **Tailwind CSS** - For utility-first styling
- **Vercel & Netlify** - For deployment and hosting

## 📞 Support

- **Website**: [https://bitsave.io](https://bitsave.io)
- **Email**: support@bitsave.io
- **Documentation**: [https://docs.bitsave.io](https://docs.bitsave.io)
- **Community**: [Telegram](https://t.me/+YimKRR7wAkVmZGRk)

---

<div align="center">
  <p>Built with ❤️ by the Bitsave Team</p>
  <p>© 2025 Bitsave. All rights reserved.</p>
</div>

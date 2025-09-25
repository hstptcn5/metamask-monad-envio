# MetaMask Smart Accounts on Monad Testnet

A comprehensive dApp demonstrating MetaMask Smart Accounts, delegation, and gasless transactions on Monad testnet.

## 🎯 Project Overview

This project showcases the power of **Account Abstraction** and **Delegation** using MetaMask Smart Accounts on Monad testnet. Users can create smart accounts, delegate spending permissions, and perform gasless transactions.

### Key Features

- 🚀 **MetaMask Smart Accounts** - Create and manage smart accounts
- 🤝 **Delegation System** - Delegate spending permissions to others
- 💰 **Gasless Transactions** - Powered by Pimlico bundler and paymaster
- 🔄 **EIP-7702 Upgrade** - Upgrade EOAs to smart accounts
- 📊 **Social Coordination** - Tips and delegation feeds
- ⚡ **Automated Subscriptions** - Automated recurring payments
- 🛡️ **Production-Ready** - Error handling, security, and performance optimizations

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Smart Accounts │    │   Monad Testnet │
│   (Next.js)     │◄──►│   (MetaMask)     │◄──►│   (mUSDC)       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Dashboard     │    │   Delegation     │    │   Gasless Tx    │
│   (Envio)       │    │   Toolkit        │    │   (Pimlico)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- MetaMask extension
- Monad testnet MON tokens (for gas)
- Pimlico API key (for gasless transactions)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd metamask-monad-envio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Monad Testnet
   MONAD_RPC_URL=https://rpc.monad-testnet.fastlane.xyz/YOUR_RPC_KEY
   MONAD_CHAIN_ID=10143
   
   # Pimlico (for gasless transactions)
   BUNDLER_RPC_URL=https://api.pimlico.io/v2/10143/rpc?apikey=YOUR_PIMLICO_API_KEY
   PAYMASTER_RPC_URL=https://api.pimlico.io/v2/10143/rpc?apikey=YOUR_PIMLICO_API_KEY
   
   # Development
   DEV_PRIVATE_KEY=0x... # For testing only
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 📱 User Flow

### 1. Connect MetaMask
- Click "Connect MetaMask" on any page
- Approve the connection
- Switch to Monad testnet (automatic)

### 2. Create Smart Account
- Go to `/upgrade-eoa`
- Choose "Create New Smart Account" (recommended)
- Transfer mUSDC from EOA to Smart Account

### 3. Create Delegation
- Go to `/subscription`
- Enter delegate address
- Set amount and period
- Sign delegation with Smart Account

### 4. Test Delegation
- Go to `/test-delegation`
- Enter delegator and delegate addresses
- Test if delegation is valid

### 5. Withdraw from Delegation
- Go to `/withdraw-delegation`
- Choose gasless or regular transaction
- Withdraw tokens from delegation

### 6. Social Tips
- Go to `/social-pay`
- Enter recipient address and amount
- Send tip (EOA to EOA transfer)

### 7. View Activity
- Go to `/dashboard`
- See all transactions, tips, and delegations
- Filter by activity type

## 🛠️ Development

### Project Structure

```
├── app/                    # Next.js app router
│   ├── dashboard/         # Social coordination dashboard
│   ├── subscription/      # Delegation creation
│   ├── test-delegation/   # Delegation testing
│   ├── withdraw-delegation/ # Delegation withdrawal
│   └── social-pay/        # Social tipping
├── components/            # React components
│   ├── MetaMaskConnect.tsx
│   ├── DelegationForm.tsx
│   ├── DelegationTester.tsx
│   ├── DelegationWithdraw.tsx
│   └── BalanceChecker.tsx
├── lib/                   # Core utilities
│   ├── smartAccount.ts    # Smart account management
│   ├── delegation.ts      # Delegation logic
│   ├── chain.ts          # Chain configuration
│   ├── clients.ts        # RPC clients
│   ├── errorHandler.ts   # Error handling
│   └── performance.ts    # Performance optimizations
├── scripts/              # Automation scripts
│   ├── automated-subscriptions.js
│   └── smoke-test.js
└── envio/                # Envio indexer (optional)
```

### Key Technologies

- **Frontend**: Next.js 14, React 18, TypeScript
- **Blockchain**: Viem, MetaMask Delegation Toolkit
- **Smart Accounts**: ERC-4337, EIP-7702
- **Gasless**: Pimlico bundler and paymaster
- **Indexing**: Envio (optional), custom blockchain indexer
- **Testing**: Custom smoke tests

### Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Automation
npm run auto-subscriptions  # Run automated subscriptions
npm run smoke-test         # Run smoke tests
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONAD_RPC_URL` | Monad testnet RPC endpoint | Yes |
| `MONAD_CHAIN_ID` | Monad testnet chain ID (10143) | Yes |
| `BUNDLER_RPC_URL` | Pimlico bundler endpoint | No |
| `PAYMASTER_RPC_URL` | Pimlico paymaster endpoint | No |
| `DEV_PRIVATE_KEY` | Development private key | No |

### Smart Account Configuration

The app uses MetaMask Delegation Toolkit with:
- **Implementation**: Hybrid smart accounts
- **Network**: Monad testnet (Chain ID: 10143)
- **Token**: mUSDC (0x3A13C20987Ac0e6840d9CB6e917085F72D17E698)

## 🧪 Testing

### Smoke Tests

Run the comprehensive smoke test:

```bash
npm run smoke-test
```

This tests:
- ✅ Delegation creation
- ✅ Delegation validation  
- ✅ Delegation testing
- ✅ Delegation redemption
- ✅ Balance checking

### Manual Testing

1. **Create delegation** → Test delegation → Withdraw delegation
2. **Send social tip** → Check balance
3. **View dashboard** → Verify activity feed

## 🚀 Deployment

### Production Build

```bash
npm run build
npm run start
```

### Environment Setup

1. Set production environment variables
2. Configure Pimlico API keys
3. Set up monitoring and logging
4. Configure rate limiting

## 📊 Monitoring

### Performance Metrics

The app includes built-in performance monitoring:
- Request timing
- Cache hit rates
- Error rates
- User operation success rates

### Logs

- **Automated subscriptions**: `logs/automated-subscriptions.log`
- **Smoke tests**: `logs/smoke-test.log`
- **Performance**: Browser console

## 🔒 Security

### Implemented Security Measures

- ✅ Input validation and sanitization
- ✅ Rate limiting
- ✅ Error handling without sensitive data exposure
- ✅ Address validation
- ✅ Amount limits
- ✅ Signature verification

### Best Practices

- Never commit private keys
- Use environment variables for sensitive data
- Validate all user inputs
- Implement proper error handling
- Monitor for suspicious activity

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

### Common Issues

**Q: MetaMask not connecting**
A: Ensure MetaMask is installed and unlocked. Check if you're on the correct network.

**Q: Gasless transactions failing**
A: Verify your Pimlico API key is correct and has sufficient credits.

**Q: Delegation not working**
A: Ensure the Smart Account has sufficient mUSDC balance and the delegation is properly signed.

**Q: RPC timeouts**
A: The app includes multiple RPC fallbacks. Check your network connection.

### Getting Help

- Check the browser console for error messages
- Run smoke tests to verify functionality
- Review the logs in the `logs/` directory
- Check environment variable configuration

## 🎉 Demo Flow

For a complete demo experience:

1. **Setup** (2 minutes)
   - Connect MetaMask
   - Switch to Monad testnet
   - Get testnet MON tokens

2. **Smart Account** (3 minutes)
   - Create new Smart Account
   - Transfer mUSDC to Smart Account
   - Verify balance

3. **Delegation** (5 minutes)
   - Create delegation to another address
   - Test delegation validity
   - Withdraw from delegation (gasless)

4. **Social Features** (3 minutes)
   - Send social tip
   - View activity dashboard
   - Filter by transaction type

5. **Automation** (2 minutes)
   - Run automated subscriptions script
   - View logs and results

**Total demo time: ~15 minutes**

---

Built with ❤️ for the Monad ecosystem and MetaMask Smart Accounts.
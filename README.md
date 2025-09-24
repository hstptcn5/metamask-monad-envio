# Monad Delegated Subscription & Social Pay Hub

MVP demo cho Smart Accounts + Delegation + Gasless transactions trên Monad testnet với Envio realtime indexing.

## 🏗️ Cấu trúc dự án

```
monad-subscription-hub/
├─ monad-erc20/              # ERC-20 token deployment
├─ envio/                    # Envio indexer
├─ app/                      # Next.js web app
├─ components/               # React components
└─ lib/                      # Utilities & SDK integration
```

## 🚀 Cách chạy end-to-end

### 1. Deploy ERC-20 Test Token

```bash
cd monad-erc20
npm install
cp env.example .env
# Điền MONAD_RPC_URL, MONAD_CHAIN_ID, DEPLOY_PK

npx hardhat compile
npx hardhat run scripts/deploy.js --network monad
# ✅ mUSDC deployed: 0x3A13C20987Ac0e6840d9CB6e917085F72D17E698
```

**Lưu ý**: Sử dụng `deploy.js` thay vì `deploy.ts` để tránh lỗi TypeScript extension.

### 2. Khởi động Envio Indexer (Tùy chọn)

**Cách 1: Sử dụng Envio**
```bash
cd envio
npm install -g @envio/cli  # hoặc npx @envio/cli
cp env.example .env
# Điền MONAD_RPC_URL, MONAD_CHAIN_ID, MUSDC_ADDRESS (từ bước 1)

npx @envio/cli dev
# Ghi lại GraphQL endpoint (vd: http://localhost:8080/graphql)
```

**Cách 2: Fallback (Khuyến nghị cho demo)**
```bash
# Không cần cài đặt gì thêm
# Web app sẽ tự động fallback về blockchain indexer
```

### 3. Chạy Web App

```bash
# Trong thư mục gốc
npm install
cp env.example .env
# Điền tất cả biến môi trường:
# - MONAD_RPC_URL, MONAD_CHAIN_ID
# - USDC_TEST=0x3A13C20987Ac0e6840d9CB6e917085F72D17E698 (đã cập nhật)
# - BUNDLER_RPC_URL, PAYMASTER_RPC_URL
# - DEV_PRIVATE_KEY (cùng với DEPLOY_PK)
# - ENVIO_GRAPHQL (endpoint từ bước 2, hoặc để trống để dùng fallback)

npm run dev
# Mở http://localhost:3000
```

## 📋 Checklist Production

### ✅ Hoàn thành
- [x] ERC-20 token contract (MonUSDC)
- [x] Smart Account integration với MetaMask SDK
- [x] Delegation creation & redemption
- [x] Gasless transactions (bundler + paymaster)
- [x] Envio indexer cho token transfers
- [x] Web UI cho tạo subscription & social tip

### 🔄 Cần cập nhật
- [ ] **Chain Config**: Xác nhận MONAD_RPC_URL và MONAD_CHAIN_ID chính xác
- [ ] **Bundler/Paymaster**: Tích hợp với provider thực (Pimlico/ZeroDev)
- [ ] **DelegationManager**: Thêm address/ABI khi MetaMask cung cấp
- [ ] **Envio Schema**: Mở rộng cho delegation events

## 🎯 Demo Flow

1. **Tạo Subscription**: Ủy quyền 10 mUSDC/tuần cho delegate sử dụng MetaMask Smart Accounts
2. **Social Tip**: Redeem delegation để tip gasless trên Monad testnet
3. **Dashboard**: Xem realtime transfers từ Envio indexer

## 🔧 Troubleshooting

### Lỗi thường gặp:
- **RPC Connection**: Kiểm tra MONAD_RPC_URL có hoạt động
- **Private Key**: Đảm bảo có đủ MON để deploy/transact
- **Bundler**: Xác nhận endpoint bundler hỗ trợ Monad testnet
- **Envio**: Kiểm tra GraphQL endpoint có trả về data

### Fallback Options:
- **Envio**: Web app tự động fallback về blockchain indexer nếu ENVIO_GRAPHQL trống
- **Bundler**: Nếu bundler chưa hỗ trợ Monad, có thể dùng direct transactions (có gas)
- **DelegationManager**: Chỉ demo token transfers nếu chưa có address/ABI

## 📚 Tài liệu tham khảo

- [MetaMask Delegation Toolkit](https://docs.metamask.io/delegation-toolkit/) - Hướng dẫn chính thức
- [MetaMask Smart Accounts](https://docs.metamask.io/delegation-toolkit/concepts/smart-accounts) - Smart Accounts concept
- [Viem Account Abstraction](https://viem.sh/docs/account-abstraction)
- [Envio Documentation](https://docs.envio.dev/)
- [Monad Testnet](https://docs.monad.xyz/)
- [Hackathon Requirements](monad%20metamask.txt) - Yêu cầu hackathon chi tiết

## 🎉 Kết quả mong đợi

Sau khi hoàn thành, bạn sẽ có:
- ✅ ERC-20 token trên Monad testnet
- ✅ Smart Account với delegation capabilities
- ✅ Gasless transactions qua bundler/paymaster
- ✅ Realtime indexing với Envio
- ✅ Web UI hoàn chỉnh cho demo

**Ready for demo video! 🎬**

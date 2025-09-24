# 🚀 Quick Start Guide

## ✅ Bước 1: Deploy Token (Hoàn thành)
```bash
# mUSDC deployed: 0x3A13C20987Ac0e6840d9CB6e917085F72D17E698
```

## 🎯 Bước 2: Chạy Web App

### Cài đặt dependencies:
```bash
npm install
# Sẽ cài đặt @metamask/delegation-toolkit@latest theo hướng dẫn chính thức
```

### Cấu hình environment:
```bash
cp env.example .env
```

### Điền vào file .env:
```env
# MONAD (đã có sẵn)
MONAD_RPC_URL=https://rpc.monad.testnet
MONAD_CHAIN_ID=20143

# Token (đã cập nhật)
USDC_TEST=0x3A13C20987Ac0e6840d9CB6e917085F72D17E698

# Bundler/Paymaster (cần điền)
BUNDLER_RPC_URL=https://api.pimlico.io/v2/20143/rpc
PAYMASTER_RPC_URL=https://api.pimlico.io/v2/20143/rpc?apikey=YOUR_KEY

# Dev signer (cần điền)
DEV_PRIVATE_KEY=0x... # Private key của bạn

# Envio (để trống để dùng fallback)
ENVIO_GRAPHQL=
```

### Chạy web app:
```bash
npm run dev
```

## 🎬 Demo Flow

1. **Mở http://localhost:3000**
2. **Tạo Subscription**: 
   - Vào `/subscription`
   - Điền delegate address
   - Set 10 mUSDC/tuần
   - Click "Tạo delegation"
3. **Social Tip**:
   - Vào `/social-pay`
   - Điền recipient address
   - Set amount (2 mUSDC)
   - Click "Redeem (gasless)"
4. **Dashboard**:
   - Vào `/dashboard`
   - Xem realtime transfers

## ⚠️ Lưu ý quan trọng

- **BUNDLER_RPC_URL**: Cần endpoint bundler hỗ trợ Monad testnet
- **PAYMASTER_RPC_URL**: Cần paymaster để gasless transactions
- **DEV_PRIVATE_KEY**: Cần private key có đủ MON để transact
- **Fallback**: Nếu bundler chưa sẵn sàng, có thể dùng direct transactions

## 🔧 Troubleshooting

### Lỗi bundler:
- Kiểm tra endpoint có hỗ trợ Monad testnet
- Có thể comment bundler code để dùng direct transactions

### Lỗi private key:
- Đảm bảo có đủ MON để transact
- Kiểm tra format private key (0x...)

### Lỗi RPC:
- Kiểm tra MONAD_RPC_URL có hoạt động
- Thử RPC khác nếu cần

## 🎉 Kết quả mong đợi

- ✅ Web app chạy trên http://localhost:3000
- ✅ Tạo delegation thành công
- ✅ Redeem gasless (nếu có bundler)
- ✅ Dashboard hiển thị transfers
- ✅ Ready for demo video!

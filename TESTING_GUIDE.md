# 🧪 Testing Guide - MetaMask Smart Accounts x Monad x Envio

## 🚀 Web App đã chạy thành công!

Bây giờ hãy test các tính năng chính của hackathon:

## 📋 Checklist Test

### 1. ✅ Basic UI Test
- [ ] **Home Page**: Mở http://localhost:3000
- [ ] **Navigation**: Click các link trong nav bar
- [ ] **Responsive**: Test trên mobile/desktop

### 2. 🎯 Core Features Test

#### A) Tạo Subscription (Delegation)
1. **Vào `/subscription`**
2. **Điền thông tin**:
   - Delegate address: `0x1234567890123456789012345678901234567890` (test address)
   - Hạn mức: `10` USDC
   - Chu kỳ: `604800` (1 tuần)
3. **Click "Tạo delegation"**
4. **Kết quả mong đợi**: 
   - Hiển thị delegation data (JSON)
   - Hoặc error message (nếu chưa config đầy đủ)

#### B) Social Tip (Redeem)
1. **Vào `/social-pay`**
2. **Điền thông tin**:
   - Gửi cho: `0x9876543210987654321098765432109876543210`
   - Số USDC: `2`
3. **Click "Redeem (gasless)"**
4. **Kết quả mong đợi**:
   - Hiển thị transaction hash
   - Hoặc error message

#### C) Dashboard (Envio)
1. **Vào `/dashboard`**
2. **Kết quả mong đợi**:
   - Hiển thị "Chưa có delegation nào" (nếu chưa có data)
   - Hoặc hiển thị transfers từ blockchain indexer

## 🔧 Configuration Test

### Environment Variables
Kiểm tra file `.env` có đầy đủ:
```env
MONAD_RPC_URL=https://rpc.monad.testnet
MONAD_CHAIN_ID=20143
USDC_TEST=0x3A13C20987Ac0e6840d9CB6e917085F72D17E698
BUNDLER_RPC_URL=...
PAYMASTER_RPC_URL=...
DEV_PRIVATE_KEY=...
ENVIO_GRAPHQL=
```

### Smart Account Test
- [ ] **Console Logs**: Mở DevTools → Console
- [ ] **Smart Account Creation**: Kiểm tra có log tạo smart account
- [ ] **Delegation Creation**: Kiểm tra có log tạo delegation

## 🐛 Expected Issues & Solutions

### 1. **Bundler/Paymaster Errors**
```
Error: Bundler not configured
Solution: Để trống BUNDLER_RPC_URL để dùng fallback
```

### 2. **RPC Connection Errors**
```
Error: RPC connection failed
Solution: Kiểm tra MONAD_RPC_URL có hoạt động
```

### 3. **Private Key Errors**
```
Error: Invalid private key
Solution: Đảm bảo DEV_PRIVATE_KEY đúng format (0x...)
```

### 4. **MetaMask SDK Errors**
```
Error: @metamask/delegation-toolkit not found
Solution: npm install @metamask/delegation-toolkit
```

## 🎬 Demo Flow Test

### Scenario 1: Happy Path
1. **Tạo delegation** → Success
2. **Redeem delegation** → Success  
3. **Dashboard hiển thị data** → Success

### Scenario 2: Fallback Mode
1. **Tạo delegation** → Mock data (nếu bundler chưa sẵn sàng)
2. **Redeem delegation** → Mock transaction hash
3. **Dashboard** → Blockchain indexer fallback

### Scenario 3: Error Handling
1. **Invalid input** → Error message
2. **Network error** → Graceful fallback
3. **Missing config** → Clear error message

## 📊 Success Criteria

### ✅ Minimum Viable Demo
- [ ] Web app chạy không lỗi
- [ ] UI hiển thị đúng
- [ ] Có thể tạo delegation (mock hoặc real)
- [ ] Có thể redeem delegation (mock hoặc real)
- [ ] Dashboard hiển thị data (mock hoặc real)

### 🎯 Full Demo (Ideal)
- [ ] MetaMask Smart Account tạo thành công
- [ ] Delegation tạo và sign thành công
- [ ] Gasless transaction thành công
- [ ] Envio indexer hiển thị realtime data

## 🚨 Troubleshooting

### Common Issues:
1. **Port 3000 đã được sử dụng**: `npm run dev -- -p 3001`
2. **Dependencies conflict**: Xóa `node_modules` và `npm install` lại
3. **TypeScript errors**: Kiểm tra `tsconfig.json`
4. **Environment variables**: Đảm bảo `.env` file đúng format

### Debug Commands:
```bash
# Kiểm tra dependencies
npm list @metamask/delegation-toolkit

# Kiểm tra TypeScript
npx tsc --noEmit

# Kiểm tra Next.js
npm run build
```

## 🎉 Ready for Demo!

Nếu tất cả test cases pass, bạn đã sẵn sàng cho:
- **Video demo** cho hackathon
- **Presentation** cho judges
- **Live demo** tại event

**Good luck! 🚀**

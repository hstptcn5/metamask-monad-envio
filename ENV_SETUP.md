# 🔧 Environment Setup Guide

## ❌ Lỗi hiện tại: "No URL was provided to the Transport"

Lỗi này xảy ra vì file `.env` chưa được tạo hoặc chưa có `MONAD_RPC_URL`.

## ✅ Cách khắc phục:

### 1. Tạo file .env
```bash
cp env.example .env
```

### 2. Điền vào file .env:
```env
# MONAD (Bắt buộc)
MONAD_RPC_URL=https://rpc.monad.testnet
MONAD_CHAIN_ID=10143

# Token (Đã có sẵn)
USDC_TEST=0x3A13C20987Ac0e6840d9CB6e917085F72D17E698

# Bundler/Paymaster (Tùy chọn - có thể để trống)
BUNDLER_RPC_URL=
PAYMASTER_RPC_URL=

# Dev signer (Tùy chọn - cho development mode)
DEV_PRIVATE_KEY=

# Envio (Tùy chọn - để trống để dùng fallback)
ENVIO_GRAPHQL=
```

### 3. Restart development server:
```bash
# Dừng server (Ctrl+C)
# Chạy lại
npm run dev
```

## 🔍 Kiểm tra cấu hình:

### Test RPC Connection:
```bash
# Test RPC URL có hoạt động không
curl -X POST https://rpc.monad.testnet \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
```

### Expected Response:
```json
{"jsonrpc":"2.0","id":1,"result":"0x2797"}
```

## 🚨 Troubleshooting:

### 1. **Hydration Error (Text content does not match)**
```bash
# Lỗi: "Text content does not match server-rendered HTML"
# Nguyên nhân: Component render khác nhau giữa server và client
# Giải pháp: Đã fix bằng ClientOnly wrapper
```
**Restart server sau khi fix:**
```bash
npm run dev
```

### 2. **File .env không tồn tại**
```bash
# Tạo file .env
touch .env
# Hoặc copy từ example
cp env.example .env
```

### 2. **MONAD_RPC_URL trống**
```env
# Đảm bảo có URL trong .env
MONAD_RPC_URL=https://rpc.monad.testnet
```

### 3. **RPC URL không hoạt động**
```env
# Thử RPC khác
MONAD_RPC_URL=https://rpc.monad.testnet
# Hoặc
MONAD_RPC_URL=https://monad-testnet-rpc.example.com
```

### 4. **Environment variables không load**
```bash
# Restart server
npm run dev
# Hoặc
npm run build && npm run start
```

## ✅ Sau khi fix:

1. **Web app chạy không lỗi**
2. **Có thể vào `/subscription`**
3. **MetaMask connect hoạt động**
4. **Console không có lỗi RPC**

## 🎯 Next Steps:

Sau khi fix lỗi RPC:
1. **Test MetaMask connection**
2. **Test tạo delegation**
3. **Test social tip**
4. **Test dashboard**

**Good luck! 🚀**

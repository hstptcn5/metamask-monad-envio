# Envio Indexer Setup

## Cách 1: Sử dụng Envio (Khuyến nghị)

### Cài đặt Envio CLI:
```bash
# Cài đặt globally
npm install -g @envio/cli

# Hoặc sử dụng npx
npx @envio/cli dev
```

### Chạy indexer:
```bash
# Trong thư mục envio/
cp env.example .env
# Điền MONAD_RPC_URL, MONAD_CHAIN_ID, MUSDC_ADDRESS

npx @envio/cli dev
# Hoặc nếu đã cài global: envio dev
```

## Cách 2: Fallback - Blockchain Indexer

Nếu Envio chưa sẵn sàng, web app sẽ tự động fallback về blockchain indexer:

```bash
# Không cần cài đặt gì thêm
# Web app sẽ query trực tiếp từ blockchain
```

## Cấu hình

### .env file:
```env
MONAD_RPC_URL=https://rpc.monad.testnet
MONAD_CHAIN_ID=20143
MUSDC_ADDRESS=0x...  # Địa chỉ mUSDC contract
START_BLOCK=0
```

### GraphQL Endpoint:
- Envio: `http://localhost:8080/graphql` (hoặc port khác)
- Fallback: Không cần endpoint

## Troubleshooting

### Lỗi package không tìm thấy:
```bash
# Thử cài đặt với tên khác
npm install -g envio-cli
# hoặc
npm install -g @envio/cli@latest
```

### Envio không chạy:
- Kiểm tra RPC URL có hoạt động
- Đảm bảo MUSDC_ADDRESS đúng
- Web app sẽ tự động fallback nếu Envio lỗi

### Fallback hoạt động:
- Web app sẽ query trực tiếp từ blockchain
- Hiển thị token transfers
- Không cần cài đặt thêm gì


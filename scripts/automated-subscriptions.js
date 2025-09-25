#!/usr/bin/env node

/**
 * Automated Subscriptions Script
 * 
 * Chạy mỗi giờ để kiểm tra và thực hiện auto-charge cho các delegation
 * đến kỳ mà chưa được redeem trong giai đoạn hiện tại.
 */

const fs = require('fs');
const path = require('path');

// Mock data - trong thực tế sẽ query từ Envio hoặc smart contract
const mockDelegations = [
  {
    id: "delegation_1",
    from: "0x1bd5aCb8069DA1051911eB80A37723aA1ce5919C",
    to: "0xa51DbFfE49FA6Fe3fC873094e47184aE624cd76f",
    scope: {
      type: "erc20PeriodTransfer",
      tokenAddress: "0x3A13C20987Ac0e6840d9CB6e917085F72D17E698",
      periodAmount: "10000000000", // 10 mUSDC in wei
      periodDuration: 3600, // 1 hour
      startDate: Math.floor(Date.now() / 1000) - 1800 // 30 minutes ago
    },
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    lastRedeemed: null
  },
  {
    id: "delegation_2", 
    from: "0x1bd5aCb8069DA1051911eB80A37723aA1ce5919C",
    to: "0xa51DbFfE49FA6Fe3fC873094e47184aE624cd76f",
    scope: {
      type: "erc20PeriodTransfer",
      tokenAddress: "0x3A13C20987Ac0e6840d9CB6e917085F72D17E698",
      periodAmount: "5000000000", // 5 mUSDC in wei
      periodDuration: 1800, // 30 minutes
      startDate: Math.floor(Date.now() / 1000) - 900 // 15 minutes ago
    },
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    lastRedeemed: null
  }
];

async function checkAndProcessDelegations() {
  console.log("🔄 Bắt đầu kiểm tra automated subscriptions...");
  console.log(`📅 Thời gian: ${new Date().toLocaleString()}`);
  
  const now = Math.floor(Date.now() / 1000);
  const processedDelegations = [];
  
  for (const delegation of mockDelegations) {
    try {
      // Kiểm tra xem delegation có đến kỳ chưa
      const startTime = delegation.scope.startDate;
      const periodDuration = delegation.scope.periodDuration;
      const elapsed = now - startTime;
      const periodsPassed = Math.floor(elapsed / periodDuration);
      
      // Kiểm tra xem đã redeem trong period hiện tại chưa
      const currentPeriodStart = startTime + (periodsPassed * periodDuration);
      const shouldRedeem = periodsPassed > 0 && 
                          (!delegation.lastRedeemed || delegation.lastRedeemed < currentPeriodStart);
      
      if (shouldRedeem) {
        console.log(`💰 Processing delegation ${delegation.id}:`);
        console.log(`   From: ${delegation.from}`);
        console.log(`   To: ${delegation.to}`);
        console.log(`   Amount: ${Number(delegation.scope.periodAmount) / 1000000} mUSDC`);
        console.log(`   Period: ${periodDuration} seconds`);
        console.log(`   Periods passed: ${periodsPassed}`);
        
        // Mock redeem delegation (trong thực tế sẽ gọi redeemDelegationGasless)
        const redeemResult = await mockRedeemDelegation(delegation);
        
        processedDelegations.push({
          delegationId: delegation.id,
          amount: Number(delegation.scope.periodAmount) / 1000000,
          status: "SUCCESS",
          transactionHash: redeemResult.transactionHash,
          timestamp: new Date().toISOString()
        });
        
        console.log(`   ✅ Redeemed: ${redeemResult.transactionHash}`);
      } else {
        console.log(`⏳ Delegation ${delegation.id}: Chưa đến kỳ hoặc đã redeem`);
      }
    } catch (error) {
      console.error(`❌ Error processing delegation ${delegation.id}:`, error.message);
      processedDelegations.push({
        delegationId: delegation.id,
        status: "FAILED",
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  // Log kết quả
  console.log("\n📊 Kết quả automated subscriptions:");
  console.log(`   Total processed: ${processedDelegations.length}`);
  console.log(`   Successful: ${processedDelegations.filter(p => p.status === "SUCCESS").length}`);
  console.log(`   Failed: ${processedDelegations.filter(p => p.status === "FAILED").length}`);
  
  // Lưu log
  const logEntry = {
    timestamp: new Date().toISOString(),
    processed: processedDelegations
  };
  
  const logFile = path.join(__dirname, '..', 'logs', 'automated-subscriptions.log');
  const logDir = path.dirname(logFile);
  
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
  
  return processedDelegations;
}

async function mockRedeemDelegation(delegation) {
  // Mock function - trong thực tế sẽ gọi redeemDelegationGasless
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
  
  return {
    transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
    status: "SUCCESS",
    message: `Auto-redeemed ${Number(delegation.scope.periodAmount) / 1000000} mUSDC`,
    gasless: true
  };
}

// Chạy script
if (require.main === module) {
  checkAndProcessDelegations()
    .then((results) => {
      console.log("\n✅ Automated subscriptions completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Automated subscriptions failed:", error);
      process.exit(1);
    });
}

module.exports = { checkAndProcessDelegations };

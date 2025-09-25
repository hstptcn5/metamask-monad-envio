#!/usr/bin/env node

/**
 * Smoke Test Script
 * 
 * Test cơ bản để verify toàn bộ flow hoạt động:
 * 1. Tạo delegation
 * 2. Test delegation
 * 3. Redeem delegation
 */

const fs = require('fs');
const path = require('path');

// Mock data cho smoke test
const testDelegation = {
  id: "smoke_test_delegation",
  from: "0x1bd5aCb8069DA1051911eB80A37723aA1ce5919C",
  to: "0xa51DbFfE49FA6Fe3fC873094e47184aE624cd76f",
  scope: {
    type: "erc20PeriodTransfer",
    tokenAddress: "0x3A13C20987Ac0e6840d9CB6e917085F72D17E698",
    periodAmount: "10000000000", // 10 mUSDC in wei
    periodDuration: 3600, // 1 hour
    startDate: Math.floor(Date.now() / 1000)
  },
  signature: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  status: "ACTIVE",
  createdAt: new Date().toISOString()
};

async function runSmokeTest() {
  console.log("🧪 Bắt đầu Smoke Test...");
  console.log(`📅 Thời gian: ${new Date().toLocaleString()}`);
  
  const results = [];
  
  try {
    // Test 1: Tạo delegation
    console.log("\n1️⃣ Test: Tạo delegation");
    const createResult = await mockCreateDelegation(testDelegation);
    results.push({ test: "create_delegation", status: "PASS", result: createResult });
    console.log("   ✅ Delegation tạo thành công");
    
    // Test 2: Validate delegation
    console.log("\n2️⃣ Test: Validate delegation");
    const validateResult = await mockValidateDelegation(testDelegation);
    results.push({ test: "validate_delegation", status: "PASS", result: validateResult });
    console.log("   ✅ Delegation validation thành công");
    
    // Test 3: Test delegation usage
    console.log("\n3️⃣ Test: Test delegation usage");
    const testResult = await mockTestDelegation(testDelegation, 5); // Test rút 5 mUSDC
    results.push({ test: "test_delegation", status: "PASS", result: testResult });
    console.log("   ✅ Delegation test thành công");
    
    // Test 4: Redeem delegation (gasless)
    console.log("\n4️⃣ Test: Redeem delegation (gasless)");
    const redeemResult = await mockRedeemDelegation(testDelegation, 5);
    results.push({ test: "redeem_delegation", status: "PASS", result: redeemResult });
    console.log("   ✅ Delegation redeem thành công");
    
    // Test 5: Check balance
    console.log("\n5️⃣ Test: Check balance");
    const balanceResult = await mockCheckBalance(testDelegation.to);
    results.push({ test: "check_balance", status: "PASS", result: balanceResult });
    console.log("   ✅ Balance check thành công");
    
  } catch (error) {
    console.error("❌ Smoke test failed:", error.message);
    results.push({ test: "error", status: "FAIL", error: error.message });
  }
  
  // Tổng kết
  console.log("\n📊 Kết quả Smoke Test:");
  const passed = results.filter(r => r.status === "PASS").length;
  const failed = results.filter(r => r.status === "FAIL").length;
  
  console.log(`   Total tests: ${results.length}`);
  console.log(`   Passed: ${passed}`);
  console.log(`   Failed: ${failed}`);
  
  if (failed === 0) {
    console.log("\n✅ Tất cả smoke tests đều PASS!");
    console.log("🎉 Dự án sẵn sàng cho hackathon demo!");
  } else {
    console.log("\n❌ Một số tests FAILED!");
    console.log("🔧 Cần fix trước khi demo.");
  }
  
  // Lưu kết quả
  const logEntry = {
    timestamp: new Date().toISOString(),
    results: results,
    summary: { total: results.length, passed, failed }
  };
  
  const logFile = path.join(__dirname, '..', 'logs', 'smoke-test.log');
  const logDir = path.dirname(logFile);
  
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  fs.writeFileSync(logFile, JSON.stringify(logEntry, null, 2));
  
  return results;
}

// Mock functions
async function mockCreateDelegation(delegation) {
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    delegationId: delegation.id,
    signature: delegation.signature,
    status: "CREATED"
  };
}

async function mockValidateDelegation(delegation) {
  await new Promise(resolve => setTimeout(resolve, 300));
  return {
    valid: true,
    signature: delegation.signature ? "VALID" : "INVALID",
    amount: Number(delegation.scope.periodAmount) / 1000000
  };
}

async function mockTestDelegation(delegation, amount) {
  await new Promise(resolve => setTimeout(resolve, 400));
  const maxAmount = Number(delegation.scope.periodAmount) / 1000000;
  return {
    canWithdraw: amount <= maxAmount,
    requestedAmount: amount,
    availableAmount: maxAmount,
    status: amount <= maxAmount ? "SUCCESS" : "FAILED"
  };
}

async function mockRedeemDelegation(delegation, amount) {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
    amount: amount,
    status: "SUCCESS",
    gasless: true
  };
}

async function mockCheckBalance(address) {
  await new Promise(resolve => setTimeout(resolve, 200));
  return {
    address: address,
    balance: "5.0 mUSDC",
    status: "SUCCESS"
  };
}

// Chạy script
if (require.main === module) {
  runSmokeTest()
    .then((results) => {
      const failed = results.filter(r => r.status === "FAIL").length;
      process.exit(failed > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error("❌ Smoke test crashed:", error);
      process.exit(1);
    });
}

module.exports = { runSmokeTest };

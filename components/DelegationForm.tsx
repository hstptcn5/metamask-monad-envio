"use client";

import { useState } from "react";
import { createDelegationWrapper, createDelegationWithMetaMask, toUsdc, DEFAULT_USDC } from "@/lib/delegation";
import { switchToMonadNetwork } from "@/lib/network";
import { getMetaMaskSmartAccount } from "@/lib/smartAccount";

export default function DelegationForm() {
  const [delegate, setDelegate] = useState<`0x${string}`>("0x1234567890123456789012345678901234567890");
  const [amount, setAmount] = useState(10);
  const [period, setPeriod] = useState(604800); // 1 tuần
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      // Đảm bảo đang ở Monad network
      await switchToMonadNetwork();

      // Validate delegate address
      if (!delegate || delegate.length !== 42 || !delegate.startsWith('0x')) {
        throw new Error("Delegate address không hợp lệ. Vui lòng nhập địa chỉ 42 ký tự bắt đầu bằng 0x");
      }

      // Tạo delegation thực tế với MetaMask Delegation Toolkit
      const smartAccount = await getMetaMaskSmartAccount();
      
      // Tạo delegation scope
      const scope = {
        type: "erc20PeriodTransfer" as const,
        tokenAddress: "0x3A13C20987Ac0e6840d9CB6e917085F72D17E698" as `0x${string}`, // mUSDC
        periodAmount: BigInt(amount * 1000000), // Convert to wei (6 decimals)
        periodDuration: period, // seconds
        startDate: Math.floor(Date.now() / 1000), // Unix timestamp
      };
      
      // Tạo delegation object với MetaMask Toolkit đúng cách
      console.log('Creating delegation with params:', {
        from: smartAccount.address,
        to: delegate as `0x${string}`,
        scope: scope,
      });
      
      // Sử dụng ENVIRONMENT BUILDERS (cùng instance với saImpl)
      const env = smartAccount.environment;
      const ZERO_AUTHORITY = `0x${'00'.repeat(32)}` as const;

      console.log('Environment structure:', {
        hasCaveats: !!env.caveats,
        hasBuilders: !!env.builders,
        caveatsKeys: env.caveats ? Object.keys(env.caveats) : 'N/A',
        buildersKeys: env.builders ? Object.keys(env.builders) : 'N/A'
      });

      let delegation;

      try {
        // Thử sử dụng environment builders
        if (env.caveats && env.caveats.erc20PeriodTransfer) {
          // 1) Build caveat từ ENVIRONMENT (cùng instance)
          const erc20PeriodCaveat = env.caveats.erc20PeriodTransfer({
            tokenAddress: scope.tokenAddress,
            periodAmount: scope.periodAmount,     // BigInt
            periodDuration: scope.periodDuration, // number (seconds)
            startDate: scope.startDate,           // unix ts (seconds)
          });

          // 2) Tạo delegation bằng ENVIRONMENT BUILDERS
          delegation = env.builders.createDelegation({
            from: smartAccount.address,
            to: delegate as `0x${string}`,
            authority: ZERO_AUTHORITY,
            caveats: [erc20PeriodCaveat],
            salt: '0x',
          });

          console.log('Created delegation with ENV builders:', delegation);
        } else {
          throw new Error('Environment caveats not available');
        }
      } catch (error) {
        console.warn('Environment builders failed, using fallback:', error);
        
        // Fallback: tạo delegation object với format đúng
        delegation = {
          delegator: smartAccount.address,
          delegate: delegate as `0x${string}`,
          authority: ZERO_AUTHORITY,
          caveats: [
            {
              type: "erc20PeriodTransfer",
              tokenAddress: scope.tokenAddress,
              periodAmount: scope.periodAmount.toString(),
              periodDuration: scope.periodDuration,
              startDate: scope.startDate
            }
          ],
          salt: "0x",
          scope: scope // Giữ scope cho compatibility
        };
        
        console.log('Created fallback delegation object:', delegation);
      }

      // Log nhẹ, KHÔNG biến đổi mảng caveats
      console.log('Created delegation with ENV builders:', {
        delegator: delegation.delegator,
        delegate: delegation.delegate,
        authority: delegation.authority,
        caveatsCount: Array.isArray(delegation.caveats) ? delegation.caveats.length : 0,
        salt: delegation.salt,
      });
      
      // Sign delegation - thử cả 2 cách
      console.log('Signing delegation with payload:', delegation);
      let signature: `0x${string}`;
      
      try {
        // Cách 1: truyền trực tiếp
        signature = await smartAccount.signDelegation(delegation);
        console.log('Received signature (direct):', signature);
      } catch (error) {
        console.warn('Direct signing failed, trying wrapper:', error);
        try {
          // Cách 2: wrapper object
          signature = await smartAccount.signDelegation({ delegation });
          console.log('Received signature (wrapper):', signature);
        } catch (error2) {
          console.error('Both signing methods failed:', error2);
          throw new Error(`Không thể ký delegation: ${error2.message}`);
        }
      }
      
      // Tạo signed delegation
      const signedDelegation = {
        ...delegation,
        signature: signature,
        id: `delegation_${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: "ACTIVE"
      };
      
      // Lưu signed delegation vào localStorage để sử dụng sau này
      const existingDelegations = JSON.parse(localStorage.getItem('delegations') || '[]');
      existingDelegations.push(signedDelegation);
      localStorage.setItem('delegations', JSON.stringify(existingDelegations, (key, value) => 
        typeof value === 'bigint' ? value.toString() : value
      ));
      
      console.log('Final signedDelegation object:', signedDelegation);
      setResult(signedDelegation);
    } catch (err: any) {
      console.error("Delegation error:", err);
      setError(err.message ?? String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Tạo Delegation (REAL)</h2>
      <p style={{ color: "#666", marginBottom: 20 }}>
        Tạo delegation thực tế - lưu vào localStorage để sử dụng sau
      </p>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, maxWidth: 520 }}>
      <label>
        Delegate address (người được ủy quyền)
        <input 
          value={delegate} 
          onChange={e => setDelegate(e.target.value as `0x${string}`)} 
          style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
          placeholder="0x... (có thể là Smart Account hoặc EOA của người khác)"
        />
        <small style={{ color: "#666", fontSize: "12px" }}>
          Có thể là Smart Account, EOA, hoặc bất kỳ địa chỉ nào trên Monad testnet
        </small>
      </label>
      <label>
        Hạn mức mỗi kỳ (USDC)
        <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} />
      </label>
      <label>
        Chu kỳ (giây)
        <input type="number" value={period} onChange={e => setPeriod(Number(e.target.value))} />
      </label>
      <button disabled={loading}>{loading ? "Đang tạo delegation..." : "Tạo delegation"}</button>

      {error && (
        <div style={{ 
          padding: 12, 
          backgroundColor: "#ffe0e0", 
          border: "1px solid #ff6b6b", 
          borderRadius: 8,
          color: "#d63031"
        }}>
          <strong>Lỗi:</strong> {error}
        </div>
      )}

        {result && (
          <div style={{ 
            padding: 12, 
            backgroundColor: "#e0ffe0", 
            border: "1px solid #00b894", 
            borderRadius: 8,
            color: "#00b894"
          }}>
            <strong>✅ Delegation tạo thành công!</strong>
            <div style={{ marginTop: 8 }}>
              <p><strong>Delegator:</strong> {result.delegator}</p>
              <p><strong>Delegate:</strong> {result.delegate}</p>
              <p><strong>Authority:</strong> {result.authority}</p>
              <p><strong>Caveats:</strong> {result.caveats?.length || 0} caveats</p>
              <p><strong>Salt:</strong> {result.salt}</p>
              <p><strong>Amount:</strong> {amount} mUSDC</p>
              <p><strong>Period:</strong> {period} seconds</p>
              <p><strong>Signature:</strong> {result.signature?.substring(0, 20) || 'N/A'}...</p>
              <p><strong>Status:</strong> {result.status}</p>
              <p><strong>Created:</strong> {new Date(result.createdAt).toLocaleString()}</p>
            </div>
            <details style={{ marginTop: 8 }}>
              <summary style={{ cursor: "pointer" }}>Xem chi tiết JSON</summary>
              <pre style={{ background: "#f4f4f4", padding: 12, borderRadius: 8, overflow: "auto", marginTop: 8 }}>
                {JSON.stringify(result, (key, value) => 
                  typeof value === 'bigint' ? value.toString() : value, 2)}
              </pre>
            </details>
          </div>
        )}
      </form>
    </div>
  );
}

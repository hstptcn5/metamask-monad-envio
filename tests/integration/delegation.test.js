/**
 * Integration Tests for Delegation System
 */

const { 
  createDelegationWrapper,
  redeemDelegationGasless,
  redeemDelegationReal,
  toUsdc
} = require('../../lib/delegation');

// Mock dependencies
jest.mock('../../lib/smartAccount', () => ({
  getMetaMaskSmartAccount: jest.fn()
}));

jest.mock('../../lib/clients', () => ({
  bundlerRpcUrl: 'https://api.pimlico.io/v2/10143/rpc?apikey=test',
  paymasterRpcUrl: 'https://api.pimlico.io/v2/10143/rpc?apikey=test'
}));

describe('Delegation Integration Tests', () => {
  let mockSmartAccount;

  beforeEach(() => {
    mockSmartAccount = {
      address: '0x1234567890123456789012345678901234567890',
      environment: {
        contracts: {
          DelegationManager: {
            address: '0xDelegationManager',
            abi: []
          }
        }
      },
      signDelegation: jest.fn(),
      encodeRedeemCalldata: jest.fn()
    };

    const { getMetaMaskSmartAccount } = require('../../lib/smartAccount');
    getMetaMaskSmartAccount.mockResolvedValue(mockSmartAccount);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createDelegationWrapper', () => {
    test('should create delegation successfully', async () => {
      const mockSignature = '0x1234567890abcdef';
      mockSmartAccount.signDelegation.mockResolvedValue(mockSignature);

      const input = {
        delegate: '0x9876543210987654321098765432109876543210',
        scope: {
          type: 'erc20PeriodTransfer',
          tokenAddress: '0x3A13C20987Ac0e6840d9CB6e917085F72D17E698',
          periodAmount: BigInt(1000000000), // 1000 mUSDC
          periodDuration: 3600, // 1 hour
          startDate: Math.floor(Date.now() / 1000)
        }
      };

      const result = await createDelegationWrapper(input);

      expect(result).toBeDefined();
      expect(result.from).toBe(mockSmartAccount.address);
      expect(result.to).toBe(input.delegate);
      expect(result.signature).toBe(mockSignature);
      expect(mockSmartAccount.signDelegation).toHaveBeenCalled();
    });

    test('should handle delegation creation error', async () => {
      mockSmartAccount.signDelegation.mockRejectedValue(new Error('Signing failed'));

      const input = {
        delegate: '0x9876543210987654321098765432109876543210',
        scope: {
          type: 'erc20PeriodTransfer',
          tokenAddress: '0x3A13C20987Ac0e6840d9CB6e917085F72D17E698',
          periodAmount: BigInt(1000000000),
          periodDuration: 3600,
          startDate: Math.floor(Date.now() / 1000)
        }
      };

      await expect(createDelegationWrapper(input)).rejects.toThrow('Signing failed');
    });
  });

  describe('redeemDelegationGasless', () => {
    test('should redeem delegation gaslessly', async () => {
      const mockUserOpHash = '0xuserop123';
      const mockTxHash = '0xtx123';
      
      // Mock the gasless transaction flow
      const mockBundlerClient = {
        sendUserOperation: jest.fn().mockResolvedValue(mockUserOpHash)
      };
      
      const mockPaymasterClient = {};
      
      const mockSmartAccountClient = {
        sendUserOperation: jest.fn().mockResolvedValue(mockUserOpHash),
        waitForUserOperationReceipt: jest.fn().mockResolvedValue({
          receipt: { transactionHash: mockTxHash }
        })
      };

      // Mock the viem account-abstraction imports
      jest.doMock('viem/account-abstraction', () => ({
        createBundlerClient: jest.fn().mockReturnValue(mockBundlerClient),
        createPaymasterClient: jest.fn().mockReturnValue(mockPaymasterClient),
        createSmartAccountClient: jest.fn().mockReturnValue(mockSmartAccountClient)
      }));

      const delegation = {
        from: '0x1234567890123456789012345678901234567890',
        to: '0x9876543210987654321098765432109876543210',
        scope: {
          periodAmount: BigInt(1000000000)
        }
      };

      const amount = 100; // 100 mUSDC

      const result = await redeemDelegationGasless(mockSmartAccount, delegation, amount);

      expect(result).toBeDefined();
      expect(result.userOpHash).toBe(mockUserOpHash);
      expect(result.transactionHash).toBe(mockTxHash);
      expect(result.gasless).toBe(true);
    });

    test('should handle gasless redemption error', async () => {
      const delegation = {
        from: '0x1234567890123456789012345678901234567890',
        to: '0x9876543210987654321098765432109876543210',
        scope: {
          periodAmount: BigInt(1000000000)
        }
      };

      // Mock error in gasless transaction
      jest.doMock('viem/account-abstraction', () => ({
        createBundlerClient: jest.fn().mockImplementation(() => {
          throw new Error('Bundler connection failed');
        })
      }));

      await expect(
        redeemDelegationGasless(mockSmartAccount, delegation, 100)
      ).rejects.toThrow('Bundler connection failed');
    });
  });

  describe('redeemDelegationReal', () => {
    test('should redeem delegation with regular transaction', async () => {
      const mockTxHash = '0xtx123';
      
      // Mock wallet client
      const mockWalletClient = {
        writeContract: jest.fn().mockResolvedValue(mockTxHash)
      };

      // Mock viem imports
      jest.doMock('viem', () => ({
        createWalletClient: jest.fn().mockReturnValue(mockWalletClient),
        custom: jest.fn()
      }));

      const delegation = {
        from: '0x1234567890123456789012345678901234567890',
        to: '0x9876543210987654321098765432109876543210',
        scope: {
          periodAmount: BigInt(1000000000)
        }
      };

      const amount = 100; // 100 mUSDC

      const result = await redeemDelegationReal(mockSmartAccount, delegation, amount);

      expect(result).toBeDefined();
      expect(result.transactionHash).toBe(mockTxHash);
      expect(result.gasless).toBe(false);
    });

    test('should handle regular redemption error', async () => {
      const delegation = {
        from: '0x1234567890123456789012345678901234567890',
        to: '0x9876543210987654321098765432109876543210',
        scope: {
          periodAmount: BigInt(1000000000)
        }
      };

      // Mock error in regular transaction
      jest.doMock('viem', () => ({
        createWalletClient: jest.fn().mockImplementation(() => {
          throw new Error('Wallet connection failed');
        })
      }));

      await expect(
        redeemDelegationReal(mockSmartAccount, delegation, 100)
      ).rejects.toThrow('Wallet connection failed');
    });
  });

  describe('toUsdc', () => {
    test('should convert number to USDC wei', () => {
      expect(toUsdc(1)).toBe(BigInt(1000000));
      expect(toUsdc(100)).toBe(BigInt(100000000));
      expect(toUsdc(0.5)).toBe(BigInt(500000));
    });

    test('should handle decimal conversion', () => {
      expect(toUsdc(1.5)).toBe(BigInt(1500000));
      expect(toUsdc(0.1)).toBe(BigInt(100000));
    });
  });

  describe('Delegation Flow Integration', () => {
    test('should complete full delegation flow', async () => {
      // 1. Create delegation
      const mockSignature = '0x1234567890abcdef';
      mockSmartAccount.signDelegation.mockResolvedValue(mockSignature);

      const input = {
        delegate: '0x9876543210987654321098765432109876543210',
        scope: {
          type: 'erc20PeriodTransfer',
          tokenAddress: '0x3A13C20987Ac0e6840d9CB6e917085F72D17E698',
          periodAmount: BigInt(1000000000),
          periodDuration: 3600,
          startDate: Math.floor(Date.now() / 1000)
        }
      };

      const delegation = await createDelegationWrapper(input);
      expect(delegation).toBeDefined();
      expect(delegation.signature).toBe(mockSignature);

      // 2. Test delegation validation
      const now = Math.floor(Date.now() / 1000);
      const elapsed = now - delegation.scope.startDate;
      const periodRemaining = Math.max(0, delegation.scope.periodDuration - elapsed);
      
      expect(periodRemaining).toBeGreaterThan(0);

      // 3. Redeem delegation
      const mockTxHash = '0xtx123';
      const mockWalletClient = {
        writeContract: jest.fn().mockResolvedValue(mockTxHash)
      };

      jest.doMock('viem', () => ({
        createWalletClient: jest.fn().mockReturnValue(mockWalletClient),
        custom: jest.fn()
      }));

      const redeemResult = await redeemDelegationReal(mockSmartAccount, delegation, 100);
      expect(redeemResult.transactionHash).toBe(mockTxHash);
    });
  });
});

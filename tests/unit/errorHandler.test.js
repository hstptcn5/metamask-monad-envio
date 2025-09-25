/**
 * Unit Tests for Error Handler
 */

const { 
  AppError, 
  ValidationError, 
  NetworkError, 
  WalletError,
  DelegationError,
  handleAsync,
  sanitizeAddress,
  validateAmount,
  validatePeriod,
  checkRateLimit
} = require('../../lib/errorHandler');

describe('Error Handler', () => {
  describe('AppError', () => {
    test('should create AppError with correct properties', () => {
      const error = new AppError('Test error', 'TEST_ERROR', 400);
      
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
    });
  });

  describe('ValidationError', () => {
    test('should create ValidationError with correct status code', () => {
      const error = new ValidationError('Invalid input');
      
      expect(error.message).toBe('Invalid input');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.statusCode).toBe(400);
    });
  });

  describe('NetworkError', () => {
    test('should create NetworkError with correct status code', () => {
      const error = new NetworkError('Network failed');
      
      expect(error.message).toBe('Network failed');
      expect(error.code).toBe('NETWORK_ERROR');
      expect(error.statusCode).toBe(503);
    });
  });

  describe('WalletError', () => {
    test('should create WalletError with correct status code', () => {
      const error = new WalletError('Wallet rejected');
      
      expect(error.message).toBe('Wallet rejected');
      expect(error.code).toBe('WALLET_ERROR');
      expect(error.statusCode).toBe(400);
    });
  });

  describe('DelegationError', () => {
    test('should create DelegationError with correct status code', () => {
      const error = new DelegationError('Delegation failed');
      
      expect(error.message).toBe('Delegation failed');
      expect(error.code).toBe('DELEGATION_ERROR');
      expect(error.statusCode).toBe(400);
    });
  });

  describe('handleAsync', () => {
    test('should return data on success', async () => {
      const asyncFn = async () => 'success';
      const result = await handleAsync(asyncFn);
      
      expect(result.data).toBe('success');
      expect(result.error).toBeUndefined();
    });

    test('should return error on failure', async () => {
      const asyncFn = async () => {
        throw new Error('Test error');
      };
      const result = await handleAsync(asyncFn);
      
      expect(result.data).toBeUndefined();
      expect(result.error).toBeInstanceOf(AppError);
      expect(result.error.message).toBe('Test error');
    });

    test('should handle user rejection error', async () => {
      const asyncFn = async () => {
        throw new Error('User rejected the transaction');
      };
      const result = await handleAsync(asyncFn);
      
      expect(result.error).toBeInstanceOf(WalletError);
      expect(result.error.message).toBe('User rejected the transaction');
    });

    test('should handle insufficient funds error', async () => {
      const asyncFn = async () => {
        throw new Error('insufficient funds');
      };
      const result = await handleAsync(asyncFn);
      
      expect(result.error).toBeInstanceOf(WalletError);
      expect(result.error.message).toBe('Insufficient funds for transaction');
    });
  });

  describe('sanitizeAddress', () => {
    test('should sanitize valid address', () => {
      const address = '0x1234567890123456789012345678901234567890';
      const result = sanitizeAddress(address);
      
      expect(result).toBe('0x1234567890123456789012345678901234567890');
    });

    test('should convert to lowercase', () => {
      const address = '0X1234567890123456789012345678901234567890';
      const result = sanitizeAddress(address);
      
      expect(result).toBe('0x1234567890123456789012345678901234567890');
    });

    test('should trim whitespace', () => {
      const address = '  0x1234567890123456789012345678901234567890  ';
      const result = sanitizeAddress(address);
      
      expect(result).toBe('0x1234567890123456789012345678901234567890');
    });

    test('should throw error for invalid address', () => {
      expect(() => sanitizeAddress('invalid')).toThrow(ValidationError);
      expect(() => sanitizeAddress('0x123')).toThrow(ValidationError);
      expect(() => sanitizeAddress('')).toThrow(ValidationError);
    });
  });

  describe('validateAmount', () => {
    test('should validate positive amount', () => {
      expect(validateAmount(100)).toBe(100);
      expect(validateAmount(0.5)).toBe(0.5);
    });

    test('should throw error for invalid amount', () => {
      expect(() => validateAmount(0)).toThrow(ValidationError);
      expect(() => validateAmount(-10)).toThrow(ValidationError);
      expect(() => validateAmount(2000000)).toThrow(ValidationError);
      expect(() => validateAmount('invalid')).toThrow(ValidationError);
    });
  });

  describe('validatePeriod', () => {
    test('should validate positive period', () => {
      expect(validatePeriod(3600)).toBe(3600);
      expect(validatePeriod(86400)).toBe(86400);
    });

    test('should throw error for invalid period', () => {
      expect(() => validatePeriod(0)).toThrow(ValidationError);
      expect(() => validatePeriod(-100)).toThrow(ValidationError);
      expect(() => validatePeriod(40000000)).toThrow(ValidationError);
      expect(() => validatePeriod('invalid')).toThrow(ValidationError);
    });
  });

  describe('checkRateLimit', () => {
    test('should allow requests within limit', () => {
      const key = 'test-key';
      
      // First 10 requests should be allowed
      for (let i = 0; i < 10; i++) {
        expect(checkRateLimit(key, 10, 60000)).toBe(true);
      }
    });

    test('should block requests over limit', () => {
      const key = 'test-key-2';
      
      // First 10 requests should be allowed
      for (let i = 0; i < 10; i++) {
        expect(checkRateLimit(key, 10, 60000)).toBe(true);
      }
      
      // 11th request should be blocked
      expect(checkRateLimit(key, 10, 60000)).toBe(false);
    });

    test('should reset after window expires', (done) => {
      const key = 'test-key-3';
      
      // Use short window for testing
      expect(checkRateLimit(key, 1, 100)).toBe(true);
      expect(checkRateLimit(key, 1, 100)).toBe(false);
      
      // Wait for window to expire
      setTimeout(() => {
        expect(checkRateLimit(key, 1, 100)).toBe(true);
        done();
      }, 150);
    });
  });
});

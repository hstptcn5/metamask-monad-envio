/**
 * Unit Tests for Performance Utilities
 */

const { 
  MemoryCache, 
  withCache, 
  BatchProcessor, 
  PerformanceMonitor,
  debounce,
  throttle
} = require('../../lib/performance');

describe('Performance Utilities', () => {
  describe('MemoryCache', () => {
    let cache;

    beforeEach(() => {
      cache = new MemoryCache();
    });

    test('should set and get data', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    test('should return null for non-existent key', () => {
      expect(cache.get('nonexistent')).toBe(null);
    });

    test('should expire data after TTL', (done) => {
      cache.set('key1', 'value1', 100); // 100ms TTL
      
      expect(cache.get('key1')).toBe('value1');
      
      setTimeout(() => {
        expect(cache.get('key1')).toBe(null);
        done();
      }, 150);
    });

    test('should delete data', () => {
      cache.set('key1', 'value1');
      cache.delete('key1');
      expect(cache.get('key1')).toBe(null);
    });

    test('should clear all data', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.clear();
      
      expect(cache.get('key1')).toBe(null);
      expect(cache.get('key2')).toBe(null);
    });

    test('should cleanup expired entries', () => {
      cache.set('key1', 'value1', 100);
      cache.set('key2', 'value2', 1000);
      
      // Wait for key1 to expire
      setTimeout(() => {
        cache.cleanup();
        expect(cache.get('key1')).toBe(null);
        expect(cache.get('key2')).toBe('value2');
      }, 150);
    });
  });

  describe('withCache', () => {
    test('should cache function results', async () => {
      let callCount = 0;
      const expensiveFunction = async (x) => {
        callCount++;
        return x * 2;
      };

      const cachedFunction = withCache(
        expensiveFunction,
        (x) => `test_${x}`,
        1000
      );

      // First call should execute function
      const result1 = await cachedFunction(5);
      expect(result1).toBe(10);
      expect(callCount).toBe(1);

      // Second call should use cache
      const result2 = await cachedFunction(5);
      expect(result2).toBe(10);
      expect(callCount).toBe(1);
    });

    test('should use different cache keys for different inputs', async () => {
      let callCount = 0;
      const expensiveFunction = async (x) => {
        callCount++;
        return x * 2;
      };

      const cachedFunction = withCache(
        expensiveFunction,
        (x) => `test_${x}`,
        1000
      );

      await cachedFunction(5);
      await cachedFunction(10);
      
      expect(callCount).toBe(2);
    });
  });

  describe('BatchProcessor', () => {
    test('should process single item', async () => {
      const processor = new BatchProcessor(
        async (inputs) => inputs.map(x => x * 2),
        10,
        100
      );

      const result = await processor.process(5);
      expect(result).toBe(10);
    });

    test('should batch multiple items', async () => {
      const processor = new BatchProcessor(
        async (inputs) => inputs.map(x => x * 2),
        2, // Batch size of 2
        50  // 50ms delay
      );

      const promises = [
        processor.process(1),
        processor.process(2),
        processor.process(3)
      ];

      const results = await Promise.all(promises);
      expect(results).toEqual([2, 4, 6]);
    });

    test('should handle errors in batch', async () => {
      const processor = new BatchProcessor(
        async (inputs) => {
          throw new Error('Batch processing failed');
        },
        2,
        50
      );

      await expect(processor.process(1)).rejects.toThrow('Batch processing failed');
    });
  });

  describe('PerformanceMonitor', () => {
    let monitor;

    beforeEach(() => {
      monitor = new PerformanceMonitor();
    });

    test('should record and return metrics', () => {
      const stopTimer = monitor.startTimer('test-operation');
      
      // Simulate some work
      setTimeout(() => {
        stopTimer();
        
        const stats = monitor.getStats('test-operation');
        expect(stats).toBeDefined();
        expect(stats.count).toBe(1);
        expect(stats.avg).toBeGreaterThan(0);
        expect(stats.min).toBeGreaterThan(0);
        expect(stats.max).toBeGreaterThan(0);
      }, 10);
    });

    test('should track multiple operations', () => {
      const stopTimer1 = monitor.startTimer('operation1');
      const stopTimer2 = monitor.startTimer('operation2');
      
      stopTimer1();
      stopTimer2();
      
      const stats1 = monitor.getStats('operation1');
      const stats2 = monitor.getStats('operation2');
      
      expect(stats1).toBeDefined();
      expect(stats2).toBeDefined();
      expect(stats1.count).toBe(1);
      expect(stats2.count).toBe(1);
    });

    test('should return null for non-existent operation', () => {
      const stats = monitor.getStats('nonexistent');
      expect(stats).toBeNull();
    });

    test('should return all stats', () => {
      const stopTimer = monitor.startTimer('test-operation');
      stopTimer();
      
      const allStats = monitor.getAllStats();
      expect(allStats).toHaveProperty('test-operation');
    });

    test('should clear all metrics', () => {
      const stopTimer = monitor.startTimer('test-operation');
      stopTimer();
      
      expect(monitor.getStats('test-operation')).toBeDefined();
      
      monitor.clear();
      expect(monitor.getStats('test-operation')).toBeNull();
    });
  });

  describe('debounce', () => {
    test('should debounce function calls', (done) => {
      let callCount = 0;
      const debouncedFn = debounce(() => {
        callCount++;
      }, 100);

      // Call multiple times quickly
      debouncedFn();
      debouncedFn();
      debouncedFn();

      // Should only execute once after delay
      setTimeout(() => {
        expect(callCount).toBe(1);
        done();
      }, 150);
    });

    test('should execute with latest arguments', (done) => {
      let lastArg = null;
      const debouncedFn = debounce((arg) => {
        lastArg = arg;
      }, 100);

      debouncedFn('first');
      debouncedFn('second');
      debouncedFn('third');

      setTimeout(() => {
        expect(lastArg).toBe('third');
        done();
      }, 150);
    });
  });

  describe('throttle', () => {
    test('should throttle function calls', (done) => {
      let callCount = 0;
      const throttledFn = throttle(() => {
        callCount++;
      }, 100);

      // Call multiple times quickly
      throttledFn();
      throttledFn();
      throttledFn();

      // Should only execute once immediately
      expect(callCount).toBe(1);

      // Wait for throttle period
      setTimeout(() => {
        throttledFn();
        expect(callCount).toBe(2);
        done();
      }, 150);
    });
  });
});

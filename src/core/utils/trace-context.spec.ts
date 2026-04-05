import { TraceContext } from './trace-context';

describe('TraceContext', () => {
    it('should run a function within a trace context', () => {
        const testId = 'test-id-123';
        TraceContext.run(testId, () => {
            expect(TraceContext.getCorrelationId()).toBe(testId);
        });
    });

    it('should return undefined when outside a context', () => {
        expect(TraceContext.getCorrelationId()).toBeUndefined();
    });

    it('should maintain isolation between parallel contexts', async () => {
        const results: (string | undefined)[] = [];

        const task1 = TraceContext.run('context-1', async () => {
            await new Promise(resolve => setTimeout(resolve, 10));
            results.push(TraceContext.getCorrelationId());
        });

        const task2 = TraceContext.run('context-2', async () => {
            await new Promise(resolve => setTimeout(resolve, 5));
            results.push(TraceContext.getCorrelationId());
        });

        await Promise.all([task1, task2]);

        expect(results).toContain('context-1');
        expect(results).toContain('context-2');
    });
});

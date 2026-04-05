import { formatDuration } from './format-duration.helper';

describe('formatDuration', () => {
  it('should format seconds correctly', () => {
    expect(formatDuration(0)).toBe('0s');
    expect(formatDuration(30)).toBe('30s');
    expect(formatDuration(60)).toBe('1m');
    expect(formatDuration(61)).toBe('1m 1s');
    expect(formatDuration(3600)).toBe('1h');
    expect(formatDuration(3661)).toBe('1h 1m 1s');
    expect(formatDuration(86400)).toBe('1d');
    expect(formatDuration(90061)).toBe('1d 1h 1m 1s');
    expect(formatDuration(31536000)).toBe('1y');
    expect(formatDuration(31536000 + 2592000 + 86400 + 3600 + 60 + 1)).toBe(
      '1y 1mo 1d 1h 1m 1s',
    );
  });

  it('should return 0s for negative numbers', () => {
    expect(formatDuration(-10)).toBe('0s');
  });
});

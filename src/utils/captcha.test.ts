import { describe, it, expect } from 'vitest';
import { generateCaptcha, validateCaptcha } from './captcha';

describe('Captcha Utility', () => {
  it('should generate a valid captcha question with an id and answer string', () => {
    const challenge = generateCaptcha();
    expect(challenge.id).toBeDefined();
    expect(challenge.question).toBeDefined();
    expect(typeof challenge.answer).toBe('string');
    expect(challenge.question).toContain('?');
  });

  it('should correctly verify valid answers', () => {
    const challenge = generateCaptcha();
    const isCorrect = validateCaptcha(challenge, challenge.answer);
    expect(isCorrect).toBe(true);
  });

  it('should reject wrong answers', () => {
    const challenge = generateCaptcha();
    const isCorrect = validateCaptcha(challenge, challenge.answer + '999');
    expect(isCorrect).toBe(false);
  });

  it('should reject empty answers or challenges', () => {
    const challenge = generateCaptcha();
    expect(validateCaptcha(challenge, '')).toBe(false);
    // @ts-expect-error testing null safety
    expect(validateCaptcha(null, '5')).toBe(false);
  });
});

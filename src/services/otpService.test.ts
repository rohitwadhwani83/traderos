import { describe, it, expect } from 'vitest';
import { OtpService } from './otpService';

describe('OtpService', () => {
  it('should generate a 6-digit OTP and validate it', () => {
    const mobile = '+91 9876543210';
    const result = OtpService.sendOtp(mobile);
    expect(result.success).toBe(true);
    expect(result.previewCode).toBeDefined();
    expect(result.previewCode.length).toBe(6);

    const validation = OtpService.verifyOtp(mobile, result.previewCode);
    expect(validation.isValid).toBe(true);
  });

  it('should reject incorrect OTP codes', () => {
    const mobile = '+91 9123456780';
    OtpService.sendOtp(mobile);
    const validation = OtpService.verifyOtp(mobile, '999999');
    expect(validation.isValid).toBe(false);
  });

  it('should enforce cooldown if requesting immediately', () => {
    const mobile = '+91 9988776655';
    const first = OtpService.sendOtp(mobile);
    expect(first.success).toBe(true);

    const second = OtpService.sendOtp(mobile);
    expect(second.success).toBe(false);
    expect(second.remainingCooldown).toBeGreaterThan(0);
  });
});

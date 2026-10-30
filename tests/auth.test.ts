import { describe, it, expect } from 'vitest';
import { mapAuthError, getResolvedAuthDomain, isFirebaseConfigured } from '../src/lib/auth/firebase';

describe('Auth Module - mapAuthError', () => {
  it('maps known popup-closed error code', () => {
    const res = mapAuthError({ code: 'auth/popup-closed-by-user', message: 'Closed by user' });
    expect(res.code).toBe('POPUP_CLOSED');
    expect(res.key).toBe('auth.errors.popup_closed');
  });

  it('maps popup-blocked error code', () => {
    const res = mapAuthError({ code: 'auth/popup-blocked', message: 'Popup blocked by browser' });
    expect(res.code).toBe('POPUP_BLOCKED');
    expect(res.key).toBe('auth.errors.popup_blocked');
  });

  it('maps network-request-failed error code', () => {
    const res = mapAuthError({ code: 'auth/network-request-failed', message: 'A network error occurred' });
    expect(res.code).toBe('NETWORK_ERROR');
    expect(res.key).toBe('auth.errors.network_error');
  });

  it('maps unauthorized-domain error code', () => {
    const res = mapAuthError({ code: 'auth/unauthorized-domain', message: 'Domain not authorized' });
    expect(res.code).toBe('UNAUTHORIZED_DOMAIN');
    expect(res.key).toBe('auth.errors.unauthorized_domain');
  });

  it('maps unknown errors to generic code and key', () => {
    const res = mapAuthError(new Error('Random error'));
    expect(res.code).toBe('UNKNOWN');
    expect(res.key).toBe('auth.errors.generic');
    expect(res.originalMessage).toBe('Random error');
  });
});

describe('Auth Module - Configuration & Domain Resolution', () => {
  it('returns boolean for isFirebaseConfigured', () => {
    expect(typeof isFirebaseConfigured()).toBe('boolean');
  });

  it('resolves valid authDomain string', () => {
    const domain = getResolvedAuthDomain();
    expect(typeof domain).toBe('string');
    expect(domain.length).toBeGreaterThan(0);
  });
});

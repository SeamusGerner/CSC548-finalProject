import {
  MAX_TARGET,
  MIN_PASSWORD_LENGTH,
  parseTarget,
  validateSignIn,
  validateSignUp,
} from './validation';

describe('validateSignIn', () => {
  it('accepts a valid email and password', () => {
    expect(validateSignIn('lifter@example.com', 'secret')).toBeNull();
  });

  it('ignores surrounding whitespace in the email', () => {
    expect(validateSignIn('  lifter@example.com ', 'secret')).toBeNull();
  });

  it('requires an email', () => {
    expect(validateSignIn('   ', 'secret')).toBe('Enter your email.');
  });

  it('rejects a malformed email', () => {
    expect(validateSignIn('lifter@example', 'secret')).toBe('Enter a valid email address.');
  });

  it('requires a password', () => {
    expect(validateSignIn('lifter@example.com', '')).toBe('Enter your password.');
  });
});

describe('validateSignUp', () => {
  it('accepts matching passwords of the minimum length', () => {
    const password = 'a'.repeat(MIN_PASSWORD_LENGTH);
    expect(validateSignUp('lifter@example.com', password, password)).toBeNull();
  });

  it('rejects a short password', () => {
    expect(validateSignUp('lifter@example.com', 'abc', 'abc')).toBe(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    );
  });

  it('rejects mismatched passwords', () => {
    expect(validateSignUp('lifter@example.com', 'secret1', 'secret2')).toBe(
      'Passwords do not match.',
    );
  });

  it('reports email errors before password errors', () => {
    expect(validateSignUp('', 'abc', 'xyz')).toBe('Enter your email.');
  });
});

describe('parseTarget', () => {
  it('parses a whole number', () => {
    expect(parseTarget('8')).toBe(8);
  });

  it('trims whitespace', () => {
    expect(parseTarget(' 12 ')).toBe(12);
  });

  it('accepts the bounds', () => {
    expect(parseTarget('1')).toBe(1);
    expect(parseTarget(String(MAX_TARGET))).toBe(MAX_TARGET);
  });

  it.each(['', '0', '-3', '2.5', 'ten', String(MAX_TARGET + 1)])('rejects %p', (input) => {
    expect(parseTarget(input)).toBeNull();
  });
});

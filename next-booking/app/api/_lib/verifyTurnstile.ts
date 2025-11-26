interface TurnstileVerifyResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
}

export async function verifyTurnstile(
  token: string,
  remoteIp?: string,
): Promise<{ success: boolean; error?: string }> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    console.error('[verifyTurnstile] TURNSTILE_SECRET_KEY is not configured');
    return { success: false, error: 'Turnstile not configured' };
  }

  if (!token) {
    return { success: false, error: 'Token is required' };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (remoteIp) {
      formData.append('remoteip', remoteIp);
    }

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    const result: TurnstileVerifyResponse = await response.json();

    if (!result.success) {
      console.warn('[verifyTurnstile] Verification failed:', result['error-codes']);
      return {
        success: false,
        error: result['error-codes']?.join(', ') || 'Verification failed',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('[verifyTurnstile] Error verifying token:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}


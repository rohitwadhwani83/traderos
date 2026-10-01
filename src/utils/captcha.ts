export interface CaptchaChallenge {
  id: string;
  question: string;
  answer: string;
}

/**
 * Generates an interactive math / logic CAPTCHA challenge.
 */
export function generateCaptcha(): CaptchaChallenge {
  const operations = ['+', '-', '*'] as const;
  const op = operations[Math.floor(Math.random() * operations.length)];

  let a = 0;
  let b = 0;
  let answer = 0;

  if (op === '+') {
    a = Math.floor(Math.random() * 20) + 5;
    b = Math.floor(Math.random() * 20) + 1;
    answer = a + b;
  } else if (op === '-') {
    a = Math.floor(Math.random() * 25) + 15;
    b = Math.floor(Math.random() * 12) + 1;
    answer = a - b;
  } else {
    // Multiplication with small numbers
    a = Math.floor(Math.random() * 9) + 2;
    b = Math.floor(Math.random() * 6) + 2;
    answer = a * b;
  }

  return {
    id: `captcha_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    question: `What is ${a} ${op === '*' ? '×' : op} ${b}?`,
    answer: String(answer),
  };
}

/**
 * Validates a CAPTCHA response.
 */
export function validateCaptcha(challenge: CaptchaChallenge, userInput: string): boolean {
  if (!challenge || !userInput) return false;
  return challenge.answer.trim() === userInput.trim();
}

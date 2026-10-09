'use client';

import React, { useId, useState } from 'react';

interface NewsletterSignupFormProps {
  source?: string;
  inputId?: string;
  inputPlaceholder?: string;
  buttonText?: string;
  label?: string;
  variant?: 'default' | 'field-guide';
  formClassName?: string;
  rowClassName?: string;
  inputClassName?: string;
  buttonClassName?: string;
  messageClassName?: string;
}

export default function NewsletterSignupForm({
  source = 'website',
  inputId: providedInputId,
  inputPlaceholder = 'your@email.com',
  buttonText = 'Subscribe',
  label = 'Email address',
  variant = 'default',
  formClassName = '',
  rowClassName = 'flex flex-col gap-4',
  inputClassName = 'w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#CC0000] transition-colors',
  buttonClassName = 'w-full bg-[#CC0000] text-white py-3 font-bold uppercase tracking-widest hover:bg-red-700 transition-colors',
  messageClassName = 'mt-3 text-sm text-center',
}: NewsletterSignupFormProps) {
  const generatedInputId = useId();
  const inputId = providedInputId || `newsletter-email-${generatedInputId}`;
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const messageId = `${inputId}-message`;
  const fieldGuide = variant === 'field-guide';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Email is required.' });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, source }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: 'error', text: data.error || 'Subscription failed.' });
        return;
      }

      setMessage({ type: 'success', text: data.message || 'Thanks for subscribing.' });
      setEmail('');
    } catch {
      setMessage({ type: 'error', text: 'Could not subscribe right now. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={formClassName}>
      <label
        htmlFor={inputId}
        className={fieldGuide
          ? 'mb-2 block text-[13px] font-black uppercase tracking-wide text-[#1a1a1a]'
          : 'sr-only'}
      >
        {label}
      </label>
      <div className={fieldGuide ? 'flex flex-wrap gap-3' : rowClassName}>
        <input
          id={inputId}
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onInvalid={(e) => {
            setMessage({
              type: 'error',
              text: e.currentTarget.validity.valueMissing ? 'Email is required.' : 'Please enter a valid email address.',
            });
          }}
          placeholder={inputPlaceholder}
          aria-describedby={messageId}
          aria-invalid={message?.type === 'error'}
          className={fieldGuide
            ? 'min-h-14 min-w-0 flex-[1_1_260px] rounded border-2 border-[#1a1a1a] px-4 text-[17px] text-[#1a1a1a] placeholder:text-gray-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a1a1a]'
            : `${inputClassName} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a1a1a]`}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className={fieldGuide
            ? 'min-h-14 flex-[0_1_auto] rounded bg-[#CC0000] px-7 text-[17px] font-black text-white transition-colors hover:bg-[#a80000] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a1a1a] disabled:cursor-not-allowed'
            : `${buttonClassName} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a1a1a] disabled:opacity-60 disabled:cursor-not-allowed`}
        >
          {loading ? 'Submitting...' : buttonText}
        </button>
      </div>
      <p
        id={messageId}
        aria-live="polite"
        role="status"
        className={message
          ? `${fieldGuide ? 'mt-3 text-sm' : messageClassName} ${message.type === 'success' ? 'text-green-700' : 'text-red-700'}`
          : 'sr-only'}
      >
        {message && <span className="sr-only">{message.type === 'success' ? 'Success: ' : 'Error: '}</span>}
        {message?.text || ''}
      </p>
    </form>
  );
}

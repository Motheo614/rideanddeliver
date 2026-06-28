'use client';

import React, { useState } from 'react';

interface NewsletterSignupFormProps {
  source?: string;
  inputId?: string;
  inputPlaceholder?: string;
  buttonText?: string;
  formClassName?: string;
  rowClassName?: string;
  inputClassName?: string;
  buttonClassName?: string;
  messageClassName?: string;
}

export default function NewsletterSignupForm({
  source = 'website',
  inputId = 'newsletter-email',
  inputPlaceholder = 'Email Address',
  buttonText = 'Subscribe',
  formClassName = '',
  rowClassName = 'flex flex-col gap-4',
  inputClassName = 'w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#CC0000] transition-colors',
  buttonClassName = 'w-full bg-[#CC0000] text-white py-3 font-bold uppercase tracking-widest hover:bg-red-700 transition-colors',
  messageClassName = 'mt-3 text-sm text-center',
}: NewsletterSignupFormProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
      <div className={rowClassName}>
        <input
          id={inputId}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={inputPlaceholder}
          className={inputClassName}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className={buttonClassName + ' disabled:opacity-60 disabled:cursor-not-allowed'}
        >
          {loading ? 'Submitting...' : buttonText}
        </button>
      </div>
      {message && (
        <p className={messageClassName + (message.type === 'success' ? ' text-green-700' : ' text-red-700')}>
          {message.text}
        </p>
      )}
    </form>
  );
}

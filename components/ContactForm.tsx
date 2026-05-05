'use client';

import { FormEvent, useState } from 'react';

type FormState = {
  name: string;
  email: string;
  message: string;
};

const INITIAL_FORM_STATE: FormState = {
  name: '',
  email: '',
  message: '',
};

export default function ContactForm() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const message = form.message.trim();

    if (name.length < 2) {
      setErrorMessage('Please enter your name.');
      return;
    }

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (message.length < 10) {
      setErrorMessage('Please enter a message with at least 10 characters.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Unable to send your message right now.');
      }

      setSuccessMessage(data?.message || 'Thanks. Your message has been sent.');
      setForm(INITIAL_FORM_STATE);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to send your message right now.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 bg-gray-50 p-8 rounded-2xl border border-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="contact-name" className="text-sm font-bold text-[#1a1a1a] uppercase tracking-wider">Name</label>
          <input
            id="contact-name"
            name="name"
            type="text"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            className="px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#CC0000]"
            placeholder="Your Name"
            autoComplete="name"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="contact-email" className="text-sm font-bold text-[#1a1a1a] uppercase tracking-wider">Email</label>
          <input
            id="contact-email"
            name="email"
            type="email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            className="px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#CC0000]"
            placeholder="your@email.com"
            autoComplete="email"
            required
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="contact-message" className="text-sm font-bold text-[#1a1a1a] uppercase tracking-wider">Message</label>
        <textarea
          id="contact-message"
          name="message"
          value={form.message}
          onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
          className="px-4 py-3 border border-gray-200 rounded h-40 focus:outline-none focus:border-[#CC0000]"
          placeholder="How can we help?"
          required
        />
      </div>

      {errorMessage ? (
        <p className="text-sm font-semibold text-red-700" role="alert">{errorMessage}</p>
      ) : null}

      {successMessage ? (
        <p className="text-sm font-semibold text-green-700" role="status">{successMessage}</p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-[#CC0000] text-white py-4 rounded-lg font-bold uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
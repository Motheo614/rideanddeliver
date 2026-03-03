import React from 'react';

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-20 max-w-3xl">
        <h1 className="text-4xl font-black text-[#1a1a1a] mb-8 text-center">Contact Us</h1>
        <p className="text-lg text-gray-600 text-center mb-12">
          Have a question about gear? Want us to review a specific product? We&apos;d love to hear from you.
        </p>
        
        <form className="flex flex-col gap-6 bg-gray-50 p-8 rounded-2xl border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-[#1a1a1a] uppercase tracking-wider">Name</label>
              <input type="text" className="px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#CC0000]" placeholder="Your Name" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-[#1a1a1a] uppercase tracking-wider">Email</label>
              <input type="email" className="px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#CC0000]" placeholder="your@email.com" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-[#1a1a1a] uppercase tracking-wider">Message</label>
            <textarea className="px-4 py-3 border border-gray-200 rounded h-40 focus:outline-none focus:border-[#CC0000]" placeholder="How can we help?"></textarea>
          </div>
          <button type="submit" className="bg-[#CC0000] text-white py-4 rounded-lg font-bold uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-900/20">
            Send Message
          </button>
        </form>
      </div>
    </main>
  );
}

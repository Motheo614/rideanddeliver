import React from 'react';
import Link from 'next/link';

export default function NewsletterWidget() {
  return (
    <div className="bg-white border border-gray-100 p-8 rounded-xl shadow-sm">
      <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">Get the Best Stories First</h3>
      <div className="w-12 h-1 bg-[#CC0000] mb-6"></div>
      
      <p className="text-gray-600 text-sm mb-6 leading-relaxed">
        Subscribe to our newsletter and receive the latest insights, guides, and product reviews delivered straight to your inbox.
      </p>
      
      <form className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="your@email.com"
          className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#CC0000] transition-colors"
          required
        />
        <button
          type="submit"
          className="w-full bg-[#CC0000] text-white py-3 font-bold uppercase tracking-widest hover:bg-red-700 transition-colors"
        >
          SUBSCRIBE
        </button>
      </form>
      
      <p className="mt-4 text-[10px] text-gray-400 text-center">
        We respect your privacy. <Link href="/privacy-policy/" className="text-[#CC0000] hover:underline">Privacy Policy</Link>
      </p>
    </div>
  );
}

import React from 'react';

export default function NightRidingSafetyPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-20 max-w-3xl">
        <h1 className="text-4xl font-black text-[#1a1a1a] mb-8">Night Delivery Riding Safety</h1>
        <div className="prose prose-lg max-w-none text-gray-600">
          <p>Riding at night increases your risk significantly. Here&apos;s how to stay safe while chasing those late-night tips.</p>
          <h2>1. Be a Christmas Tree</h2>
          <p>You can never have too many lights. Use a steady front light to see the road and a flashing rear light to be seen. Consider spoke lights or helmet-mounted lights for side visibility.</p>
          <h2>2. Reflective Everything</h2>
          <p>High-visibility vests are standard, but reflective tape on your pedals and wheels is even better because drivers notice movement more than static objects.</p>
          <h2>3. Ride Defensively</h2>
          <p>Assume drivers can&apos;t see you. Avoid blind spots, signal early, and stay extra alert at intersections.</p>
        </div>
      </div>
    </main>
  );
}

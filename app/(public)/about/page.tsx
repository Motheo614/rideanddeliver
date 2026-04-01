import React from 'react';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="container mx-auto max-w-4xl px-4 py-16 md:py-20">
        <h1 className="text-4xl md:text-5xl font-black text-[#1a1a1a] leading-tight">
          About Rider Complex
        </h1>

        <h2 className="mt-8 text-2xl md:text-3xl font-extrabold text-[#1a1a1a] leading-tight">
          I Started This Site Because I Wasted Too Much Money Learning the Hard Way
        </h2>

        <div className="mt-8 space-y-6 text-base md:text-lg leading-relaxed text-gray-700">
          <p>
            My name is Marcus Webb. I have been delivering on two wheels in New York City since 2019 - through winters, rain, and the kind of traffic that makes most people quit after a week.
          </p>

          <p>
            I did not start riding because I loved motorcycles. I started because I got laid off from my logistics job in late 2018 and needed income fast. A buddy told me delivery riding paid well if you put in the hours. He was right. But nobody told me how much money I would burn through in the first six months buying the wrong gear, trusting the wrong forum posts, and learning things the expensive way.
          </p>

          <p>
            Bad gloves that shredded after two weeks. A cheap U-lock that a thief popped in thirty seconds outside a restaurant in Bushwick. An insulated bag that let every pizza I delivered arrive cold. A helmet that fogged up the moment the temperature dropped. I made every mistake.
          </p>

          <p>
            By 2021 I had figured out what actually works. And I noticed that most of the gear advice online was written by people who had never delivered a single order. Generic motorcycle blogs. Amazon review farms. Reddit threads where nobody agreed on anything. There was nothing built specifically for riders who do this for income - people who need gear that holds up on real shifts, not just weekend rides.
          </p>

          <p className="font-bold text-[#1a1a1a]">So I built Rider Complex.</p>
        </div>

        <h2 className="mt-12 text-2xl md:text-3xl font-extrabold text-[#1a1a1a]">What This Site Is</h2>
        <div className="mt-6 space-y-6 text-base md:text-lg leading-relaxed text-gray-700">
          <p>
            Rider Complex is a gear and earnings resource for delivery riders - people who ride bikes, e-bikes, and motorcycles for DoorDash, Uber Eats, Grubhub, and similar platforms. Every recommendation on this site is filtered through one question: does this actually make your shifts better, safer, and more profitable?
          </p>

          <p>
            I focus on gear that is available on Amazon in the US, priced realistically for riders who are watching every dollar, and tested in real delivery conditions. Not parking lot tests. Not weekend rides. Real stops, real weather, real NYC traffic.
          </p>
        </div>

        <h2 className="mt-12 text-2xl md:text-3xl font-extrabold text-[#1a1a1a]">How I Test and Review Gear</h2>
        <div className="mt-6 space-y-6 text-base md:text-lg leading-relaxed text-gray-700">
          <p>
            I ride a Honda CB500F out of Brooklyn. I still take shifts regularly - partly because I enjoy it, mostly because it keeps me honest. If I recommend a U-lock, it is because I have used it on real stops in neighborhoods where bike theft is not hypothetical. If I say a delivery bag keeps food hot for 40 minutes, it is because I timed it on actual orders, not in a kitchen test.
          </p>

          <p>
            For products I have not personally owned long-term, I research obsessively - rider forums, verified Amazon reviews, real shift feedback - and I tell you clearly what my assessment is based on. I do not pretend to have tested everything. What I do is cut through the noise and tell you what is worth your money and what is not.
          </p>
        </div>

        <h2 className="mt-12 text-2xl md:text-3xl font-extrabold text-[#1a1a1a]">A Note on Affiliate Links</h2>
        <div className="mt-6 space-y-6 text-base md:text-lg leading-relaxed text-gray-700">
          <p>
            Some links on this site are affiliate links. If you buy something through them, I earn a small commission at no extra cost to you. This is how the site stays free. It does not affect what I recommend - I have turned down partnerships with brands whose gear I would not use on my own shifts. My recommendations come from riding, not from who pays the most.
          </p>
        </div>

        <h2 className="mt-12 text-2xl md:text-3xl font-extrabold text-[#1a1a1a]">Let&apos;s Connect</h2>
        <div className="mt-6 space-y-6 text-base md:text-lg leading-relaxed text-gray-700">
          <p>
            Got a question about a specific piece of gear? Want to know which delivery platform is worth your time in your city? Hit the contact page. I read every message.
          </p>

          <p className="font-semibold text-[#1a1a1a]">- Marcus Webb, Brooklyn NY</p>
        </div>
      </section>
    </main>
  );
}

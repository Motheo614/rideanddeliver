export const metadata = {
  title: { absolute: 'Gear Comparison Tool │ RiderComplex' },
  description:
    'Compare two pieces of motorcycle or delivery gear side by side with an AI-powered breakdown — pros, cons, head-to-head scores, and a straight verdict.',
};

export default function GearComparisonLayout({ children }) {
  // Use the site's public header/footer chrome so the tool matches the blog
  const Header = require('@/components/Header').default;
  const Footer = require('@/components/Footer').default;

  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}

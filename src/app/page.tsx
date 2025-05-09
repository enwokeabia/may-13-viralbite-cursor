import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5eafe] via-[#f3f0ff] to-white">
      <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-center gap-8 p-4 md:p-0">
        {/* Left Card: Logo, tagline, CTA */}
        <div className="bg-white/90 rounded-2xl shadow-xl p-8 md:w-1/2 w-full flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-fuchsia-500 mb-2">ViralBite</h1>
          <p className="text-lg text-gray-700 mb-6 text-center font-medium">Performance-Based Restaurant-Influencer Marketing</p>
          <div className="w-full flex flex-col gap-4">
            <Link href="/auth/login" aria-label="Log in to ViralBite" className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white font-semibold py-3 rounded-lg shadow hover:from-fuchsia-500 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-colors text-center">Log in</Link>
            <Link href="/auth/signup" aria-label="Sign up for ViralBite" className="w-full border-2 border-purple-500 text-purple-700 font-semibold py-3 rounded-lg hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-colors text-center">Sign up</Link>
          </div>
          <p className="mt-6 text-sm text-gray-500">Don&apos;t have an account? <Link href="/auth/signup" className="underline text-purple-600">Sign up</Link></p>
        </div>
        {/* Right Card: Marketing/Benefits */}
        <div className="bg-gradient-to-br from-purple-600 to-fuchsia-500 rounded-2xl shadow-xl p-8 md:w-1/2 w-full flex flex-col justify-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Amplify Your Restaurant&apos;s Impact</h2>
          <p className="mb-6 text-lg">Connect with influencers to create performance-based marketing campaigns that drive real results. Track views, engagement, and calculate ROI in real-time.</p>
          <ul className="space-y-4">
            <li className="flex items-center gap-3">
              <span className="inline-block bg-white/20 rounded-full p-2" aria-hidden="true">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m4 4h1a2 2 0 002-2v-5a2 2 0 00-2-2h-1.5M7 16H6a2 2 0 01-2-2v-5a2 2 0 012-2h1.5" /></svg>
              </span>
              <span>Track real-time performance metrics for all your campaigns</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="inline-block bg-white/20 rounded-full p-2" aria-hidden="true">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </span>
              <span>Pay only for actual views and engagement with your content</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="inline-block bg-white/20 rounded-full p-2" aria-hidden="true">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M9 20H4v-2a3 3 0 015.356-1.857M15 11a4 4 0 10-6 0" /></svg>
              </span>
              <span>Connect with authentic influencers who align with your brand values</span>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}

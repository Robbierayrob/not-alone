import Image from 'next/image';
import Link from 'next/link';
import SearchForm from './components/SearchForm';

export default function Home() {
  return (
    <main className="relative">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
        <div className="morphing-background">
          <div className="morphing-shape"></div>
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 space-y-12">
          {/* Main Hero Content */}
          <div className="text-center space-y-6">
            <h1 className="text-7xl font-bold tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                Not Alone
              </span>
            </h1>
            <p className="text-2xl text-gray-700 font-light max-w-3xl mx-auto leading-relaxed">
              Your safe space for healing and empowerment. 
              <br />
              Let our AI companion guide your journey to strength.
            </p>
          </div>

          {/* Search Section */}
          <div className="w-full max-w-[1200px] mx-auto backdrop-blur-sm rounded-2xl">
            <SearchForm />
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-8 mt-12">
            <div className="flex items-center gap-3 bg-white/80 px-6 py-3 rounded-full shadow-sm">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              </div>
              <span className="font-medium">End-to-End Encrypted</span>
            </div>
            <div className="flex items-center gap-3 bg-white/80 px-6 py-3 rounded-full shadow-sm">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
                </svg>
              </div>
              <span className="font-medium">UN SDG #5 Partner</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-white/50 to-secondary/50 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Your Journey to Empowerment</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature Cards */}
            <div className="feature-card group">
              <div className="feature-icon-wrapper">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="feature-title">Private & Secure</h3>
              <p className="feature-description">Your story is protected with military-grade encryption and complete anonymity.</p>
            </div>

            <div className="feature-card group">
              <div className="feature-icon-wrapper">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="feature-title">AI Companion</h3>
              <p className="feature-description">24/7 supportive AI diary companion to listen, understand, and guide you.</p>
            </div>

            <div className="feature-card group">
              <div className="feature-icon-wrapper">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="feature-title">Support Network</h3>
              <p className="feature-description">Connect with verified resources and professional support when needed.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

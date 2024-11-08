import Image from 'next/image';
import Link from 'next/link';
import SearchForm from './components/SearchForm';
import { Heart, Shield, Users, HandHeart, Award, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <main className="relative min-h-screen">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
        {/* Morphing Background */}
        <div className="absolute inset-0">
          <div className="morphing-background">
      
          </div>
          <div className="pulsating-circle"></div>
        </div>
        
        <div className="relative z-10 max-w-[1000px] mx-auto px-4 space-y-16">
          {/* Main Hero Content */}
          <div className="text-center space-y-8">
            <h1 className="text-[72px] font-bold tracking-tight text-gray-900 leading-tight">
              Empowering women through
              <span className="block mt-2">
                technology and community
              </span>
            </h1>
            <p className="text-2xl text-gray-800 font-medium max-w-2xl mx-auto leading-relaxed">
              We're building AI-powered solutions to advance gender equality and women's empowerment, 
              aligned with UN Sustainable Development Goal 5.
            </p>
          </div>

          {/* Search Section */}
          <div className="w-full max-w-[800px] mx-auto">
            <SearchForm />
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-6 mt-16">
            <div className="group flex items-center gap-4 bg-white/95 hover:bg-gradient-to-r hover:from-[rgba(255,209,233,0.1)] hover:to-[rgba(190,178,255,0.1)]
                          px-8 py-4 rounded-2xl shadow-lg backdrop-blur-sm border border-[rgba(255,209,233,0.2)] transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-[rgba(255,209,233,0.1)] flex items-center justify-center">
                <Shield className="w-6 h-6 text-gray-800" />
              </div>
              <span className="text-lg font-medium text-gray-800">Private & Secure</span>
            </div>
            <div className="group flex items-center gap-4 bg-white/95 hover:bg-gradient-to-r hover:from-[rgba(190,178,255,0.1)] hover:to-[rgba(173,216,255,0.1)]
                          px-8 py-4 rounded-2xl shadow-lg backdrop-blur-sm border border-[rgba(190,178,255,0.2)] transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-[rgba(190,178,255,0.1)] flex items-center justify-center">
                <Award className="w-6 h-6 text-gray-800" />
              </div>
              <span className="text-lg font-medium text-gray-800">UN SDG #5 Partner</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white/50 backdrop-blur-sm relative overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Advancing Gender Equality Through Innovation</h2>
            <p className="text-lg text-gray-600">Supporting UN SDG 5's mission to achieve gender equality and empower all women and girls through technology and community.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature Cards */}
            <div className="group p-8 rounded-2xl bg-white hover:bg-gradient-to-b hover:from-white hover:to-[rgba(255,209,233,0.1)]
                          border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-[rgba(255,209,233,0.1)] flex items-center justify-center mb-6
                            group-hover:bg-[rgba(255,209,233,0.2)] transition-colors duration-300">
                <Heart className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Safe Space for Healing</h3>
              <p className="text-gray-600 leading-relaxed">A secure platform where women can share experiences, find support, and begin their journey of healing from domestic violence.</p>
            </div>

            <div className="group p-8 rounded-2xl bg-white hover:bg-gradient-to-b hover:from-white hover:to-[rgba(190,178,255,0.1)]
                          border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-[rgba(190,178,255,0.1)] flex items-center justify-center mb-6
                            group-hover:bg-[rgba(190,178,255,0.2)] transition-colors duration-300">
                <Sparkles className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">AI-Powered Support</h3>
              <p className="text-gray-600 leading-relaxed">24/7 AI companion trained to provide empathetic guidance, resources, and support for improving relationships and personal growth.</p>
            </div>

            <div className="group p-8 rounded-2xl bg-white hover:bg-gradient-to-b hover:from-white hover:to-[rgba(173,216,255,0.1)]
                          border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-[rgba(173,216,255,0.1)] flex items-center justify-center mb-6
                            group-hover:bg-[rgba(173,216,255,0.2)] transition-colors duration-300">
                <HandHeart className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Community Support</h3>
              <p className="text-gray-600 leading-relaxed">Connect with a global network of survivors, advocates, and professionals dedicated to ending gender-based violence.</p>
            </div>
          </div>

          {/* SDG 5 Goals Section */}
          <div className="mt-24 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-12">Supporting UN Sustainable Development Goal 5</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="p-6 rounded-xl bg-white border border-gray-100 shadow-md">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <Users className="w-6 h-6 text-primary" />
                  <h4 className="text-lg font-semibold text-gray-900">End Discrimination</h4>
                </div>
                <p className="text-gray-600">Working to end all forms of discrimination against women and girls everywhere.</p>
              </div>
              <div className="p-6 rounded-xl bg-white border border-gray-100 shadow-md">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                  <h4 className="text-lg font-semibold text-gray-900">Eliminate Violence</h4>
                </div>
                <p className="text-gray-600">Supporting the elimination of all forms of violence against women and girls.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

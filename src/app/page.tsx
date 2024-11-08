import Image from 'next/image';
import Link from 'next/link';
import SearchForm from './components/SearchForm';

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <section className="min-h-[90vh] flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
        <div className="morphing-background">
          <div className="morphing-shape"></div>
        </div>
        <h1 className="text-6xl font-bold mb-6 relative z-10">
          Revolutionizing the Future of
          <span className="text-primary"> Dairy</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl relative z-10">
          Discover the next generation of dairy products powered by artificial intelligence
        </p>
        <div className="relative z-10">
          <SearchForm />
        </div>
      </section>

      {/* Features Section */}
      <section className="section-container bg-secondary">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-full h-48 bg-accent rounded-lg mb-4" />
              <h3 className="text-xl font-semibold mb-2">Feature {i}</h3>
              <p className="text-gray-600">
                Experience the future of dairy with our innovative solutions.
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

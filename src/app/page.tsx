import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <section className="min-h-[90vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-6xl font-bold mb-6">
          Revolutionizing the Future of
          <span className="text-primary"> Dairy</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl">
          Discover the next generation of dairy products powered by artificial intelligence
        </p>
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            window.location.href = '/dairy';
          }}
          className="w-full max-w-2xl"
        >
          <input
            type="text"
            placeholder="Search dairy products..."
            className="hero-search"
          />
        </form>
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

export default function AboutPage() {
  return (
    <div className="section-container pt-24">
      <h1 className="text-4xl font-bold mb-8">About DairyAI</h1>
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-lg text-gray-600 mb-6">
            We're revolutionizing the dairy industry through innovative technology 
            and sustainable practices.
          </p>
          <p className="text-lg text-gray-600">
            Our mission is to create the future of dairy products while maintaining 
            the highest standards of quality and sustainability.
          </p>
        </div>
        <div className="bg-accent rounded-xl h-[400px]" />
      </div>
    </div>
  );
}

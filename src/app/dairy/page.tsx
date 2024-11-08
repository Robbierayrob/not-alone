export default function DairyPage() {
  return (
    <div className="section-container pt-24">
      <h1 className="text-4xl font-bold mb-8">Dairy Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="w-full h-48 bg-accent rounded-lg mb-4" />
            <h3 className="text-xl font-semibold mb-2">Product {i}</h3>
            <p className="text-gray-600">
              Premium dairy product with innovative features.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

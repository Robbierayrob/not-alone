'use client';

import { useRouter } from 'next/navigation';

export default function SearchForm() {
  const router = useRouter();

  return (
    <form 
      onSubmit={(e) => {
        e.preventDefault();
        router.push('/dairy');
      }}
      className="w-full max-w-2xl"
    >
      <input
        type="text"
        placeholder="Search dairy products..."
        className="hero-search"
      />
    </form>
  );
}

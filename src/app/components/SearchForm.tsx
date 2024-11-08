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
      className=" max-w-[1200px] mx-auto"
    >
      <input
        type="text"
        placeholder="Start Your Diary..."
        className="hero-search"
      />
    </form>
  );
}

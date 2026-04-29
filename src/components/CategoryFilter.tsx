"use client";

import { CATEGORIES } from "@/lib/mockData";

interface Props {
  selected: string;
  onChange: (category: string) => void;
}

export default function CategoryFilter({ selected, onChange }: Props) {
  console.log("[CategoryFilter] selected:", selected);

  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selected === cat
              ? "bg-indigo-600 text-white"
              : "bg-white text-gray-600 border border-gray-300 hover:border-indigo-400"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

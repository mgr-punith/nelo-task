"use client";

type FiltersProps = {
  filter: string;
  setFilter: (filter: string) => void;
};

const options = [
  { key: "all", label: "All" },
  { key: "completed", label: "Completed" },
  { key: "pending", label: "Pending" },
  { key: "HIGH", label: "High Priority" },
  { key: "MEDIUM", label: "Medium Priority" },
  { key: "LOW", label: "Low Priority" },
];

export default function Filters({ filter, setFilter }: FiltersProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {options.map(({ key, label }) => (
        <button
          key={key}
          className={`px-4 py-2 rounded ${
            filter === key
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => setFilter(key)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

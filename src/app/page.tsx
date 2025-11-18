
 "use client";
import { useState } from "react";

const wbs = [
  {
    group: "Superstructure",
    breakdowns: [
      "Reinforced Concrete Columns",
      "Reinforced Concrete Beams",
      "Suspended Slab",
      "Shear Walls",
      "Staircase Structure",
    ],
  },
  {
    group: "Finishes",
    breakdowns: [
      "Floor Finishes: Tiles",
      "Floor Finishes: Granite",
      "Floor Finishes: Vinyl Flooring",
      "Floor Finishes: Epoxy",
      "Wall Finishes: Plastering",
      "Wall Finishes: Paint",
      "Wall Finishes: Cladding",
      "Ceiling Finishes: Gypsum Board",
      "Ceiling Finishes: Acoustic Panels",
    ],
  },
  // ...add more groups as needed
];

export default function Home() {
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedBreakdown, setSelectedBreakdown] = useState("");
  const [param, setParam] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);


  const handleCalculate = () => {
    setResult(
      `Group: ${selectedGroup}\nBreakdown: ${selectedBreakdown}\nParameter: ${param}\nEstimated Quantity: ${param ? Number(param) * 1.1 : "-"}`
    );
    setSaveStatus(null);
  };

  const handleSave = async () => {
    setSaveStatus("Saving...");
    try {
      const res = await fetch("/api/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group: selectedGroup,
          breakdown: selectedBreakdown,
          parameter: param,
          estimatedQuantity: param ? Number(param) * 1.1 : null,
          date: new Date().toISOString(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveStatus("Saved successfully!");
      } else {
        setSaveStatus("Save failed.");
      }
    } catch (err) {
      setSaveStatus("Error saving estimate.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-16 px-8 bg-white dark:bg-black sm:items-start">
        <h1 className="text-3xl font-bold mb-6 text-black dark:text-zinc-50">Building Quantity Estimator</h1>
        <form
          className="flex flex-col gap-4 w-full max-w-lg"
          onSubmit={(e) => {
            e.preventDefault();
            handleCalculate();
          }}
        >
          <label className="font-medium">Major Group</label>
          <select
            className="border rounded px-3 py-2"
            value={selectedGroup}
            onChange={(e) => {
              setSelectedGroup(e.target.value);
              setSelectedBreakdown("");
            }}
            required
          >
            <option value="">Select group</option>
            {wbs.map((g) => (
              <option key={g.group} value={g.group}>
                {g.group}
              </option>
            ))}
          </select>
          {selectedGroup && (
            <>
              <label className="font-medium">Breakdown</label>
              <select
                className="border rounded px-3 py-2"
                value={selectedBreakdown}
                onChange={(e) => setSelectedBreakdown(e.target.value)}
                required
              >
                <option value="">Select breakdown</option>
                {wbs
                  .find((g) => g.group === selectedGroup)
                  ?.breakdowns.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
              </select>
            </>
          )}
          {selectedBreakdown && (
            <>
              <label className="font-medium">Parameter (e.g., area, volume, quantity)</label>
              <input
                type="number"
                className="border rounded px-3 py-2"
                value={param}
                onChange={(e) => setParam(e.target.value)}
                placeholder="Enter value"
                required
              />
              <button
                type="submit"
                className="bg-black text-white rounded px-4 py-2 mt-2 hover:bg-zinc-800"
              >
                Calculate
              </button>
            </>
          )}
        </form>
        {result && (
          <div className="mt-8 p-4 border rounded bg-zinc-100 dark:bg-zinc-900 text-black dark:text-zinc-50 whitespace-pre-line">
            <strong>Result:</strong>
            <br />
            {result}
            <button
              className="bg-green-600 text-white rounded px-4 py-2 mt-4 hover:bg-green-700"
              onClick={handleSave}
            >
              Save Estimate
            </button>
            {saveStatus && (
              <div className="mt-2 text-sm text-green-700 dark:text-green-400">{saveStatus}</div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

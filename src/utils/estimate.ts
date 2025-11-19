// Utility functions for estimate logic
export function calculateEstimate(param: string, selectedGroup: string, selectedBreakdown: string) {
  return `Group: ${selectedGroup}\nBreakdown: ${selectedBreakdown}\nParameter: ${param}\nEstimated Quantity: ${param ? Number(param) * 1.1 : "-"}`;
}

export async function saveEstimate({ group, breakdown, parameter, estimatedQuantity }: {
  group: string;
  breakdown: string;
  parameter: string;
  estimatedQuantity: number | null;
}) {
  try {
    const res = await fetch("/api/estimate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        group,
        breakdown,
        parameter,
        estimatedQuantity,
        date: new Date().toISOString(),
      }),
    });
    const data = await res.json();
    return data.success ? "Saved successfully!" : "Save failed.";
  } catch (err) {
    return "Error saving estimate.";
  }
}

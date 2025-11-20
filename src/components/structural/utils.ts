import { BeamSpec, ColumnSpec, Building, BuildingSummary, SlabSpec } from './types';

// Standard reinforcement bar sizes
export const BAR_SIZES = [8, 10, 12, 16, 20, 25, 32];

// Standard reinforcement bar weights (kg/m) based on steel density 7850 kg/m³
export const BAR_WEIGHTS: { [key: number]: number } = {
  8: 0.395,   // 8mm = 0.395 kg/m
  10: 0.617,  // 10mm = 0.617 kg/m
  12: 0.888,  // 12mm = 0.888 kg/m
  16: 1.578,  // 16mm = 1.578 kg/m
  20: 2.466,  // 20mm = 0.617 kg/m
  25: 3.853,  // 25mm = 3.853 kg/m
  32: 6.313   // 32mm = 6.313 kg/m
};

// Calculate reinforcement weights per meter for a beam
export const calculateReinforcementWeights = (beam: BeamSpec): { grade40Weight: number; grade60Weight: number; totalWeight: number } => {
  let grade40Weight = 0; // < 16mm
  let grade60Weight = 0; // >= 16mm
  
  // Top bars
  if (beam.topBarSize && beam.topBarQty > 0) {
    const weight = BAR_WEIGHTS[beam.topBarSize] * beam.topBarQty;
    if (beam.topBarSize < 16) {
      grade40Weight += weight;
    } else {
      grade60Weight += weight;
    }
  }
  
  // Web bars
  if (beam.webBarSize && beam.webBarQty > 0) {
    const weight = BAR_WEIGHTS[beam.webBarSize] * beam.webBarQty;
    if (beam.webBarSize < 16) {
      grade40Weight += weight;
    } else {
      grade60Weight += weight;
    }
  }
  
  // Bottom bars
  if (beam.bottomBarSize && beam.bottomBarQty > 0) {
    const weight = BAR_WEIGHTS[beam.bottomBarSize] * beam.bottomBarQty;
    if (beam.bottomBarSize < 16) {
      grade40Weight += weight;
    } else {
      grade60Weight += weight;
    }
  }
  
  // Stirrups - perimeter calculation
  if (beam.stirrupSize && beam.stirrupQty > 0) {
    const perimeter = 2 * (beam.width + beam.depth); // beam perimeter in meters
    const stirrupLength = perimeter * beam.stirrupQty; // total stirrup length per meter of beam
    const weight = BAR_WEIGHTS[beam.stirrupSize] * stirrupLength;
    if (beam.stirrupSize < 16) {
      grade40Weight += weight;
    } else {
      grade60Weight += weight;
    }
  }
  
  return { grade40Weight, grade60Weight, totalWeight: grade40Weight + grade60Weight };
};

// Calculate column reinforcement weights
export const calculateColumnReinforcementWeights = (column: ColumnSpec) => {
  // Main bars weight calculation
  const mainBarWeight = BAR_WEIGHTS[column.mainBarSize] || 0;
  const mainBarTotalWeight = mainBarWeight * column.height * column.mainBarQty;
  
  // Ties weight calculation (perimeter ties)
  const columnPerimeter = 2 * (column.width + column.depth);
  const numberOfTies = Math.ceil(column.height / column.tieSpacing);
  const tieWeight = BAR_WEIGHTS[column.tieSize] || 0;
  const tiesTotalWeight = tieWeight * columnPerimeter * numberOfTies;
  
  const totalSteelWeight = mainBarTotalWeight + tiesTotalWeight;
  
  // Grade classification (same as beams)
  const mainBarGrade = column.mainBarSize < 16 ? 40 : 60;
  const tieGrade = column.tieSize < 16 ? 40 : 60;
  
  let grade40Weight = 0;
  let grade60Weight = 0;
  
  if (mainBarGrade === 40) {
    grade40Weight += mainBarTotalWeight;
  } else {
    grade60Weight += mainBarTotalWeight;
  }
  
  if (tieGrade === 40) {
    grade40Weight += tiesTotalWeight;
  } else {
    grade60Weight += tiesTotalWeight;
  }
  
  return { grade40Weight, grade60Weight, totalWeight: grade40Weight + grade60Weight };
};

// Calculate building summary across all floors
export const calculateBuildingSummary = (building: Building): BuildingSummary => {
  let totalConcreteVolume = 0;
  let totalGrade40Steel = 0;
  let totalGrade60Steel = 0;
  const floorBreakdown: BuildingSummary['floorBreakdown'] = [];

  building.floors.forEach(floor => {
    // Calculate beam summary for this floor
    const beamSummaryMap = new Map();
    
    // Column lengths (X direction)
    const colLengths = [];
    for (let r = 0; r < floor.structuralSystem.numRows; r++) {
      for (let c = 0; c < floor.structuralSystem.numCols - 1; c++) {
        const from = floor.structuralSystem.cols[c];
        const to = floor.structuralSystem.cols[c + 1];
        const length = Math.abs(to.position - from.position);
        const beamIdIndex = r * (floor.structuralSystem.numCols - 1) + c;
        const beamId = floor.colBeamIds[beamIdIndex];
        if (beamId) {
          colLengths.push({ beamId, len: length, segment: `${floor.structuralSystem.rows[r].label}${from.label}-${floor.structuralSystem.rows[r].label}${to.label}` });
        }
      }
    }
    
    // Row lengths (Y direction)
    const rowLengths = [];
    for (let c = 0; c < floor.structuralSystem.numCols; c++) {
      for (let r = 0; r < floor.structuralSystem.numRows - 1; r++) {
        const from = floor.structuralSystem.rows[r];
        const to = floor.structuralSystem.rows[r + 1];
        const length = Math.abs(to.position - from.position);
        const beamIdIndex = c * (floor.structuralSystem.numRows - 1) + r;
        const beamId = floor.rowBeamIds[beamIdIndex];
        if (beamId) {
          rowLengths.push({ beamId, len: length, segment: `${from.label}${floor.structuralSystem.cols[c].label}-${to.label}${floor.structuralSystem.cols[c].label}` });
        }
      }
    }
    
    // Aggregate beam data
    [...colLengths, ...rowLengths].forEach(({ beamId, len, segment }) => {
      if (!beamSummaryMap.has(beamId)) {
        beamSummaryMap.set(beamId, { segments: [], totalLength: 0 });
      }
      const summary = beamSummaryMap.get(beamId);
      summary.segments.push(segment);
      summary.totalLength += len;
    });
    
    // Calculate floor totals
    let floorConcreteVolume = 0;
    let floorGrade40Steel = 0;
    let floorGrade60Steel = 0;
    const beamBreakdown: BuildingSummary['floorBreakdown'][0]['beamBreakdown'] = [];
    const columnBreakdown: BuildingSummary['floorBreakdown'][0]['columnBreakdown'] = [];
    
    // Add beam calculations
    beamSummaryMap.forEach((summary, beamId) => {
      const beam = floor.beamSpecs.find(b => b.id === beamId);
      if (beam) {
        const beamConcreteVolume = summary.totalLength * beam.width * beam.depth;
        const weights = calculateReinforcementWeights(beam);
        const beamGrade40Steel = weights.grade40Weight * summary.totalLength;
        const beamGrade60Steel = weights.grade60Weight * summary.totalLength;
        
        floorConcreteVolume += beamConcreteVolume;
        floorGrade40Steel += beamGrade40Steel;
        floorGrade60Steel += beamGrade60Steel;
        
        beamBreakdown.push({
          beamId,
          segments: summary.segments,
          totalLength: summary.totalLength,
          concreteVolume: beamConcreteVolume,
          grade40Steel: beamGrade40Steel,
          grade60Steel: beamGrade60Steel,
        });
      }
    });
    
    // Add column calculations with location tracking
    const columnSummaryMap = new Map();
    floor.columnIds.forEach((columnId, index) => {
      if (columnId) {
        const rowIndex = Math.floor(index / floor.structuralSystem.numCols);
        const colIndex = index % floor.structuralSystem.numCols;
        const location = `${floor.structuralSystem.rows[rowIndex].label}${floor.structuralSystem.cols[colIndex].label}`;
        
        if (!columnSummaryMap.has(columnId)) {
          columnSummaryMap.set(columnId, { locations: [], count: 0 });
        }
        const summary = columnSummaryMap.get(columnId);
        summary.locations.push(location);
        summary.count += 1;
      }
    });
    
    columnSummaryMap.forEach((summary, columnId) => {
      const column = floor.columnSpecs.find(c => c.id === columnId);
      if (column) {
        const singleColumnConcreteVolume = column.width * column.depth * column.height;
        const weights = calculateColumnReinforcementWeights(column);
        const totalColumnConcreteVolume = singleColumnConcreteVolume * summary.count;
        const totalGrade40Steel = weights.grade40Weight * summary.count;
        const totalGrade60Steel = weights.grade60Weight * summary.count;
        
        floorConcreteVolume += totalColumnConcreteVolume;
        floorGrade40Steel += totalGrade40Steel;
        floorGrade60Steel += totalGrade60Steel;
        
        columnBreakdown.push({
          columnId,
          locations: summary.locations,
          count: summary.count,
          concreteVolume: totalColumnConcreteVolume,
          grade40Steel: totalGrade40Steel,
          grade60Steel: totalGrade60Steel,
        });
      }
    });
    
    totalConcreteVolume += floorConcreteVolume;
    totalGrade40Steel += floorGrade40Steel;
    totalGrade60Steel += floorGrade60Steel;
    
    floorBreakdown.push({
      floorId: floor.id,
      floorName: floor.name,
      concreteVolume: floorConcreteVolume,
      grade40Steel: floorGrade40Steel,
      grade60Steel: floorGrade60Steel,
      beamBreakdown,
      columnBreakdown,
    });
  });
  
  return {
    totalConcreteVolume,
    totalGrade40Steel,
    totalGrade60Steel,
    floorBreakdown,
  };
};

// Calculate reinforcement weights for a slab per square meter
export const calculateSlabReinforcementWeights = (slab: SlabSpec): { grade40Weight: number; grade60Weight: number; totalWeight: number } => {
  let grade40Weight = 0; // < 16mm
  let grade60Weight = 0; // >= 16mm

  // Main reinforcement (bottom layer)
  if (slab.mainBarSize && slab.mainBarSpacing > 0) {
    const barsPerMeter = 1000 / slab.mainBarSpacing; // bars per meter
    const weight = BAR_WEIGHTS[slab.mainBarSize] * barsPerMeter;

    // For two-way slabs, main bars are in both directions
    // For one-way slabs, main bars are only in the spanning direction
    const totalMainWeight = slab.type === 'two-way' ? weight * 2 : weight;

    if (slab.mainBarSize < 16) {
      grade40Weight += totalMainWeight;
    } else {
      grade60Weight += totalMainWeight;
    }
  }

  // Distribution bars (perpendicular to main bars)
  if (slab.distributionBarSize && slab.distributionBarSpacing > 0) {
    const barsPerMeter = 1000 / slab.distributionBarSpacing;
    const weight = BAR_WEIGHTS[slab.distributionBarSize] * barsPerMeter;

    // For two-way slabs, distribution bars are also in both directions
    // For one-way slabs, distribution bars are in the non-spanning direction
    const totalDistWeight = slab.type === 'two-way' ? weight * 2 : weight;

    if (slab.distributionBarSize < 16) {
      grade40Weight += totalDistWeight;
    } else {
      grade60Weight += totalDistWeight;
    }
  }

  // Temperature reinforcement (top layer)
  if (slab.temperatureBarSize && slab.temperatureBarSpacing > 0) {
    const barsPerMeter = 1000 / slab.temperatureBarSpacing;
    const weight = BAR_WEIGHTS[slab.temperatureBarSize] * barsPerMeter;
    // Temperature bars are typically in a grid pattern (both directions)
    const totalTempWeight = weight * 2;

    if (slab.temperatureBarSize < 16) {
      grade40Weight += totalTempWeight;
    } else {
      grade60Weight += totalTempWeight;
    }
  }

  // Additional top reinforcement if specified
  if (slab.topBarSize && slab.topBarSpacing && slab.topBarSpacing > 0) {
    const barsPerMeter = 1000 / slab.topBarSpacing;
    const weight = BAR_WEIGHTS[slab.topBarSize] * barsPerMeter;
    // For two-way slabs, top bars are in both directions
    const totalTopWeight = slab.type === 'two-way' ? weight * 2 : weight;

    if (slab.topBarSize < 16) {
      grade40Weight += totalTopWeight;
    } else {
      grade60Weight += totalTopWeight;
    }
  }

  return {
    grade40Weight: Math.round(grade40Weight * 100) / 100,
    grade60Weight: Math.round(grade60Weight * 100) / 100,
    totalWeight: Math.round((grade40Weight + grade60Weight) * 100) / 100
  };
};

// Calculate concrete volume for a slab
export const calculateSlabConcreteVolume = (slab: SlabSpec, area: number): number => {
  // Convert thickness from mm to meters
  const thicknessM = slab.thickness / 1000;
  return area * thicknessM;
};

// Get design recommendations based on slab type and dimensions
export const getSlabDesignRecommendations = (slab: SlabSpec): {
  recommendedThickness: number;
  recommendedMainSpacing: number;
  recommendedDistSpacing: number;
  designNotes: string[];
} => {
  const aspectRatio = slab.spanLength / slab.spanWidth;
  const notes: string[] = [];

  let recommendedThickness = 125; // default
  let recommendedMainSpacing = 150;
  let recommendedDistSpacing = 250;

  if (slab.type === 'one-way') {
    // One-way slab design
    if (aspectRatio >= 2) {
      notes.push("✅ Good aspect ratio for one-way slab design");
      recommendedThickness = Math.max(100, Math.min(200, slab.spanLength * 30)); // L/30 rule
    } else {
      notes.push("⚠️ Aspect ratio < 2, consider two-way design");
    }

    // Main reinforcement in longer direction
    recommendedMainSpacing = Math.min(300, Math.max(100, slab.spanLength * 1000 / 5)); // approx 5 bars per span
    recommendedDistSpacing = Math.min(400, Math.max(150, slab.spanWidth * 1000 / 3)); // fewer bars in short direction

  } else {
    // Two-way slab design
    if (aspectRatio <= 2) {
      notes.push("✅ Good aspect ratio for two-way slab design");
      recommendedThickness = Math.max(125, Math.min(250, Math.max(slab.spanLength, slab.spanWidth) * 35)); // L/35 rule
    } else {
      notes.push("⚠️ High aspect ratio, one-way design may be more economical");
    }

    // Reinforcement in both directions
    const maxSpan = Math.max(slab.spanLength, slab.spanWidth);
    recommendedMainSpacing = Math.min(250, Math.max(125, maxSpan * 1000 / 6)); // approx 6 bars per span
    recommendedDistSpacing = recommendedMainSpacing; // similar spacing in both directions
  }

  // Thickness validation
  if (slab.thickness < recommendedThickness * 0.8) {
    notes.push(`⚠️ Thickness may be insufficient. Recommended: ${recommendedThickness}mm`);
  } else if (slab.thickness > recommendedThickness * 1.5) {
    notes.push("ℹ️ Thickness is conservative, consider optimizing");
  }

  return {
    recommendedThickness,
    recommendedMainSpacing,
    recommendedDistSpacing,
    designNotes: notes
  };
};
"use client"

import React, { useState } from 'react'
import SlabTab from '../../components/structural/SlabTab'
import { SlabSpec } from '../../components/structural/types'

export default function TestPage() {
  const [slabSpecs, setSlabSpecs] = useState<SlabSpec[]>([
    {
      id: 'S1',
      thickness: 125,
      type: 'two-way',
      spanLength: 6,
      spanWidth: 4,
      mainBarSize: 12,
      mainBarSpacing: 150,
      distributionBarSize: 8,
      distributionBarSpacing: 250,
      temperatureBarSize: 8,
      temperatureBarSpacing: 150,
      topBarSize: null,
      topBarSpacing: null
    }
  ])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              🧪 Slab Specification Test Page
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Test and experiment with slab specifications, including two-way slabs, distribution bars, and temperature reinforcement
            </p>
          </div>

          {/* Slab Specification Component */}
          <div className="mb-8">
            <SlabTab slabSpecs={slabSpecs} setSlabSpecs={setSlabSpecs} />
          </div>

          {/* Additional Test Area */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 min-h-[200px]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Additional Test Space</h3>
            <div className="text-center text-gray-500 dark:text-gray-400">
              <p>Add more test components or code here</p>
            </div>
          </div>

          {/* Console Output */}
          <div className="mt-6">
            <button
              onClick={() => console.log('Slab specs:', slabSpecs)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mr-4"
            >
              Log Slab Specs
            </button>
            <button
              onClick={() => console.log('Test button clicked')}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Test Console Log
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
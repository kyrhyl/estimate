"use client"

import React, { useState } from 'react'
import SlabTab from '../../components/structural/SlabTab'
import SlabAssignmentTab from '../../components/structural/SlabAssignmentTab'
import { SlabSpec, SlabAssignment } from '../../components/structural/types'

export default function TestPage() {
  const [activeTab, setActiveTab] = useState<'slabs' | 'assignments'>('slabs')

  const [slabSpecs, setSlabSpecs] = useState<SlabSpec[]>([
    {
      id: 'S1',
      thickness: 125,
      type: 'two-way',
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

  const [slabAssignments, setSlabAssignments] = useState<SlabAssignment[]>([])

  // Mock grid data for testing
  const mockRows = [
    { label: 'A', position: 0 },
    { label: 'B', position: 4 },
    { label: 'C', position: 8 }
  ]
  const mockCols = [
    { label: '1', position: 0 },
    { label: '2', position: 6 },
    { label: '3', position: 12 }
  ]

  const tabs = [
    { id: 'slabs' as const, label: 'Slab Specifications' },
    { id: 'assignments' as const, label: 'Slab Assignment' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              🧪 Structural Components Test Page
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Test and experiment with structural components in isolation
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white border-b border-gray-200 mb-8">
            <div className="max-w-7xl mx-auto px-4">
              <nav className="flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="max-w-7xl mx-auto py-10 px-4">
            {activeTab === 'slabs' && (
              <SlabTab slabSpecs={slabSpecs} setSlabSpecs={setSlabSpecs} />
            )}

            {activeTab === 'assignments' && (
              <SlabAssignmentTab
                slabAssignments={slabAssignments}
                setSlabAssignments={setSlabAssignments}
                slabSpecs={slabSpecs}
                rows={mockRows}
                cols={mockCols}
              />
            )}
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
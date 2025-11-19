interface TabNavigationProps {
  activeTab: 'beams' | 'columns' | 'grid' | 'summary';
  onTabChange: (tab: 'beams' | 'columns' | 'grid' | 'summary') => void;
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs = [
    { id: 'beams' as const, label: 'Beam Specifications' },
    { id: 'columns' as const, label: 'Column Specifications' },
    { id: 'grid' as const, label: 'Grid System & Assignment' },
    { id: 'summary' as const, label: 'Building Summary' },
  ];

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
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
  );
}
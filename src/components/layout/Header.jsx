import React, { useState } from 'react';
import { Menu, X, TrendingUp, Settings } from 'lucide-react';
import useStore from '../../store';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { ui, setTimeRange } = useStore();

  const timeRanges = [
    { value: '24h', label: '24H' },
    { value: '7d', label: '7D' },
    { value: '30d', label: '30D' },
    { value: '90d', label: '90D' },
    { value: '1y', label: '1Y' },
  ];

  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-bold text-white">Financial Viz</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2 bg-gray-700 rounded-lg p-1">
              {timeRanges.map((range) => (
                <button
                  key={range.value}
                  onClick={() => setTimeRange(range.value)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    ui.selectedTimeRange === range.value
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-600'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
            
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Settings size={20} />
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-700">
            <div className="grid grid-cols-5 gap-2">
              {timeRanges.map((range) => (
                <button
                  key={range.value}
                  onClick={() => {
                    setTimeRange(range.value);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`py-2 rounded-md text-sm font-medium transition-colors ${
                    ui.selectedTimeRange === range.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;

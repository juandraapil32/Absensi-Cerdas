import React from 'react';
import { Settings, HelpCircle } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  className: string;
}

const Header: React.FC<HeaderProps> = ({ onOpenSettings, onOpenHelp, className }) => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <img 
                src="https://iili.io/fOwTdwg.png" 
                alt="Logo SDN 2 Sidareja" 
                className="h-16 w-auto object-contain drop-shadow-sm filter hover:scale-105 transition-transform duration-200" 
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">AbsensiCerdas</h1>
              <p className="text-sm text-gray-500 font-medium">SDN 2 Sidareja • {className || "Kelas Belum Diatur"}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onOpenHelp}
              className="p-2 rounded-full text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 focus:outline-none transition-colors"
              title="Panduan Penggunaan"
            >
              <HelpCircle className="h-6 w-6" />
            </button>
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              title="Pengaturan"
            >
              <Settings className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
import React from 'react';
import { Menu, Globe, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LogoPreviewHeader = ({ logoUrl, settings, previewBgColor = '#ffffff' }) => {
  const { width, height, opacity, alignment, paddingX } = settings;

  // Calculate container alignment class
  const getAlignmentClass = () => {
    switch (alignment) {
      case 'center': return 'justify-center';
      case 'right': return 'justify-end';
      case 'left': 
      default: return 'justify-start';
    }
  };

  return (
    <div className="w-full border rounded-xl overflow-hidden bg-white shadow-sm transition-all duration-300">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-2 text-xs font-mono text-gray-500 border-b flex justify-between items-center">
        <span className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
           HEADER PREVIEW
        </span>
        <span className="font-medium text-gray-600">{width}px × {height === 'auto' ? 'Auto' : height + 'px'} | {opacity}%</span>
      </div>
      
      {/* Mock Header Container */}
      <div 
        className="transition-colors duration-500 ease-in-out border-b relative"
        style={{ backgroundColor: previewBgColor }}
      >
        <div className="container px-4 mx-auto">
          <div className="flex items-center justify-between h-24">
            
            {/* Logo Container Area - This is what we are previewing */}
            <div 
              className={`flex-1 flex items-center ${getAlignmentClass()}`}
              style={{ paddingLeft: `${paddingX}px`, paddingRight: `${paddingX}px` }}
            >
              {logoUrl ? (
                <div className="relative group transition-all duration-300">
                   {/* Selection Indicator Overlay */}
                   <div className="absolute -inset-2 border-2 border-dashed border-blue-400/0 group-hover:border-blue-400/30 rounded-lg transition-all pointer-events-none"></div>
                   
                   <img 
                    src={logoUrl} 
                    alt="Logo Preview" 
                    className="transition-all duration-300 ease-out"
                    style={{ 
                      width: `${width}px`,
                      height: height === 'auto' ? 'auto' : `${height}px`,
                      opacity: opacity / 100,
                      objectFit: 'contain'
                    }}
                  />
                  {/* Visual helper for size */}
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    {width}px width
                  </div>
                </div>
              ) : (
                <div className="flex items-center opacity-50 grayscale">
                   <span className="text-2xl font-bold text-gray-800">SPI Corporate</span>
                </div>
              )}
            </div>

            {/* Mock Navigation (Blurred/Faded to emphasize logo) */}
            <div className="hidden lg:flex items-center space-x-6 opacity-30 pointer-events-none grayscale select-none">
              <span className="text-sm font-medium text-gray-800">Accueil</span>
              <span className="text-sm font-medium text-gray-800">À Propos</span>
              <span className="text-sm font-medium text-gray-800">Nos Activités</span>
              <Button variant="ghost" size="icon" className="text-gray-800">
                <Globe className="h-5 w-5" />
              </Button>
            </div>

             {/* Mobile Menu Icon Mock */}
             <div className="lg:hidden opacity-30">
                <Menu size={28} />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoPreviewHeader;
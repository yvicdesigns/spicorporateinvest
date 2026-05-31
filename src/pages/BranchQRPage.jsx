import React, { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Printer, ArrowLeft, Pipette } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LINKS_URL = 'https://www.spicorpinvest.com/links';

const PRESET_COLORS = [
  { label: 'Bleu SPI',  value: '#1e3a8a' },
  { label: 'Or SPI',    value: '#d4af37' },
  { label: 'Noir',      value: '#000000' },
  { label: 'Blanc',     value: '#ffffff' },
  { label: 'Gris',      value: '#374151' },
  { label: 'Rouge',     value: '#dc2626' },
  { label: 'Vert',      value: '#16a34a' },
  { label: 'Violet',    value: '#7c3aed' },
];

const BranchQRPage = () => {
  const navigate = useNavigate();
  const qrRef = useRef(null);
  const [fgColor, setFgColor] = useState('#1e3a8a');

  const handleDownload = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const canvas = document.createElement('canvas');
    const size = 1000;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    // No white fill → transparent PNG
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size);
      const link = document.createElement('a');
      link.download = 'SPI-Corporate-QR-transparent.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgStr)));
  };

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f1c3f] to-[#1e3a8a] flex flex-col items-center justify-center px-4 py-10 print:bg-white">

      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 flex items-center gap-2 text-white/60 hover:text-white transition-colors print:hidden"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Retour</span>
      </button>

      <div className="flex flex-col items-center gap-6 print:gap-4 w-full max-w-sm">

        {/* Title */}
        <div className="text-center print:hidden">
          <h1 className="text-2xl font-bold text-white mb-1">Code QR — SPI Corporate Invest</h1>
          <p className="text-white/60 text-sm">Fond transparent · couleur personnalisable</p>
        </div>

        {/* QR preview on checkerboard (shows transparency) */}
        <div
          ref={qrRef}
          className="rounded-3xl shadow-2xl p-6 print:shadow-none print:p-2"
          style={{
            backgroundImage:
              'repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%)',
            backgroundSize: '20px 20px',
          }}
        >
          <QRCodeSVG
            value={LINKS_URL}
            size={260}
            bgColor="transparent"
            fgColor={fgColor}
            level="H"
            includeMargin={false}
          />
        </div>

        {/* Color picker */}
        <div className="w-full bg-white/10 border border-white/20 rounded-2xl p-4 space-y-3 print:hidden">
          <p className="text-white/80 text-sm font-semibold flex items-center gap-2">
            <Pipette className="w-4 h-4 text-[#d4af37]" />
            Couleur du QR code
          </p>

          {/* Preset swatches */}
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setFgColor(value)}
                title={label}
                className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 active:scale-95 ${
                  fgColor === value
                    ? 'border-[#d4af37] ring-2 ring-[#d4af37]/50 scale-110'
                    : 'border-white/30'
                }`}
                style={{ backgroundColor: value }}
              />
            ))}
          </div>

          {/* Custom color input */}
          <div className="flex items-center gap-3">
            <label
              htmlFor="custom-color"
              className="relative w-10 h-10 rounded-xl border-2 border-white/30 overflow-hidden cursor-pointer hover:border-[#d4af37] transition-colors flex-shrink-0"
              style={{ backgroundColor: fgColor }}
            >
              <input
                id="custom-color"
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </label>
            <div className="flex-1">
              <input
                type="text"
                value={fgColor}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setFgColor(v);
                }}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm font-mono focus:outline-none focus:border-[#d4af37]"
                placeholder="#000000"
                maxLength={7}
              />
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 w-full print:hidden">
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 bg-[#d4af37] hover:bg-[#c49e2f] text-[#0f1c3f] font-semibold px-4 py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          >
            <Download className="w-4 h-4" />
            PNG transparent
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-3 rounded-xl border border-white/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Printer className="w-4 h-4" />
            Imprimer
          </button>
        </div>

        <p className="text-white/30 text-xs text-center print:hidden">
          Le PNG téléchargé est 1000×1000 px avec fond transparent
        </p>
      </div>
    </div>
  );
};

export default BranchQRPage;

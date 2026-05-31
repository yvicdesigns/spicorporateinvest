import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Printer, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LINKS_URL = 'https://www.spicorpinvest.com/links';

const BranchQRPage = () => {
  const navigate = useNavigate();
  const qrRef = useRef(null);

  const handleDownload = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const canvas = document.createElement('canvas');
    const size = 800;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      const link = document.createElement('a');
      link.download = 'SPI-Corporate-QR.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgStr)));
  };

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f1c3f] to-[#1e3a8a] flex flex-col items-center justify-center px-4 py-10 print:bg-white">
      {/* Back button - hidden on print */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 flex items-center gap-2 text-white/60 hover:text-white transition-colors print:hidden"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Retour</span>
      </button>

      <div className="flex flex-col items-center gap-6 print:gap-4">
        {/* Title */}
        <div className="text-center print:hidden">
          <h1 className="text-2xl font-bold text-white mb-1">Code QR — SPI Corporate Invest</h1>
          <p className="text-white/60 text-sm">Scannez pour accéder à toutes nos branches</p>
        </div>

        {/* QR Code card */}
        <div
          ref={qrRef}
          className="bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-4 print:shadow-none print:p-4"
        >
          <QRCodeSVG
            value={LINKS_URL}
            size={280}
            bgColor="#ffffff"
            fgColor="#1e3a8a"
            level="H"
            includeMargin={false}
            imageSettings={{
              src: '',
              x: undefined,
              y: undefined,
              height: 48,
              width: 48,
              excavate: true,
            }}
          />
          <div className="text-center">
            <p className="text-[#1e3a8a] font-bold text-lg">SPI Corporate Invest</p>
            <p className="text-[#d4af37] text-xs font-semibold tracking-widest uppercase mt-0.5">
              Développer · Innover · Construire
            </p>
            <p className="text-gray-400 text-xs mt-2">{LINKS_URL}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 print:hidden">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 bg-[#d4af37] hover:bg-[#c49e2f] text-[#0f1c3f] font-semibold px-5 py-3 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg"
          >
            <Download className="w-4 h-4" />
            Télécharger PNG
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-3 rounded-xl border border-white/20 transition-all hover:scale-105 active:scale-95"
          >
            <Printer className="w-4 h-4" />
            Imprimer
          </button>
        </div>

        <p className="text-white/30 text-xs text-center print:hidden max-w-xs">
          Ce QR code pointe vers la page de présentation de toutes les branches SPI
        </p>
      </div>
    </div>
  );
};

export default BranchQRPage;

import { useRef, useState } from 'react';
import html2pdf from 'html2pdf.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function PDFSummaryGenerator({ bookingData }) {
  const printRef = useRef();
  const [generating, setGenerating] = useState(false);

  const handleDownloadPdf = async () => {
    setGenerating(true);
    const element = printRef.current;
    element.style.display = 'block'; // Make it visible for html2pdf rendering

    // Give browser time to paint the element and load basic styles
    await new Promise(resolve => setTimeout(resolve, 300));

    const opt = {
      margin:       10,
      filename:     `Journey_Summary_${bookingData?.id || 'Trip'}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error("PDF generation failed", err);
    } finally {
      element.style.display = 'none'; // Hide it again
      setGenerating(false);
    }
  };

  return (
    <>
      <button 
        onClick={handleDownloadPdf}
        disabled={generating || !bookingData}
        className="flex items-center gap-2 bg-[#121619] hover:bg-[#1e2429] text-[#FFAA00] px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
      >
        {generating ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faFilePdf} />}
        Download Itinerary PDF
      </button>

      {/* Hidden DOM element for PDF Generation */}
      <div style={{ display: 'none' }}>
        <div ref={printRef} className="p-8 max-w-4xl mx-auto bg-white text-gray-900 font-sans" style={{ width: '800px' }}>
          {/* Header */}
          <div className="flex justify-between items-end border-b-4 border-[#FFAA00] pb-6 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-[#121619] tracking-tight">Journey Summary</h1>
              <p className="text-gray-500 mt-2 text-lg">Firstflight Travels Official Itinerary</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-400 uppercase tracking-widest text-sm">Booking ID</p>
              <p className="text-xl font-mono text-[#121619]">{bookingData?.id || 'FF-TRIP-90210'}</p>
            </div>
          </div>

          {/* Timeline Logs */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
            <h2 className="text-xl font-bold text-[#121619] mb-4 uppercase tracking-wider text-sm">Timeline</h2>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm mb-1">Departure</p>
                <p className="text-lg font-bold">{bookingData?.fromDate || '12 Oct 2026'}</p>
                <p className="font-medium text-[#121619] mt-1">{bookingData?.from || 'New Delhi, IN'}</p>
              </div>
              <div className="text-gray-300 text-2xl font-light">➔</div>
              <div className="text-right">
                <p className="text-gray-500 text-sm mb-1">Return</p>
                <p className="text-lg font-bold">{bookingData?.toDate || '18 Oct 2026'}</p>
                <p className="font-medium text-[#121619] mt-1">{bookingData?.to || 'Goa, IN'}</p>
              </div>
            </div>
          </div>

          {/* Profiles */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-xl font-bold text-[#121619] mb-4 border-b pb-2">Transport Allocation</h2>
              <div className="space-y-2">
                <p><span className="text-gray-500 w-24 inline-block">Type:</span> <span className="font-semibold capitalize">{bookingData?.type || 'Flight'}</span></p>
                <p><span className="text-gray-500 w-24 inline-block">Vendor:</span> <span className="font-semibold">{bookingData?.vendorName || 'IndiGo Airlines'}</span></p>
                <p><span className="text-gray-500 w-24 inline-block">Status:</span> <span className="text-green-600 font-bold">Confirmed</span></p>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#121619] mb-4 border-b pb-2">Accommodation</h2>
              <div className="space-y-2">
                <p><span className="text-gray-500 w-24 inline-block">Hotel:</span> <span className="font-semibold">{bookingData?.hotelName || 'Seabreeze Resort Goa'}</span></p>
                <p><span className="text-gray-500 w-24 inline-block">Address:</span> <span className="font-semibold text-sm">Baga Beach Road, Goa</span></p>
                <p><span className="text-gray-500 w-24 inline-block">Check-in:</span> <span className="font-semibold">14:00 Hrs</span></p>
              </div>
            </div>
          </div>

          {/* Advisories */}
          <div>
            <h2 className="text-xl font-bold text-[#121619] mb-4 border-b pb-2">Meteorological Advisories</h2>
            <div className="bg-[#FFAA00]/10 border border-[#FFAA00] p-4 rounded-lg">
              <ul className="list-disc list-inside space-y-2 text-[#121619]">
                <li><strong>High UV Alert:</strong> Sun exposure should be strictly limited between 10 AM and 4 PM.</li>
                <li><strong>Clear Conditions:</strong> Weather conditions are optimal for outdoor activities.</li>
                <li><strong>Safety Partner:</strong> Your selected vendors hold a verified Safety Badge for adherence to guidelines.</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-16 text-center text-gray-400 text-sm pt-8 border-t border-gray-100">
            <p>Thank you for choosing Firstflight Travels.</p>
            <p className="mt-1">For support, call 1800-FF-TRAVELS or visit firstflight.app</p>
          </div>
        </div>
      </div>
    </>
  );
}

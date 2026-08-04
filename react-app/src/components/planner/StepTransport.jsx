import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlane, 
  faBus, 
  faClock, 
  faCheck, 
  faArrowRight, 
  faArrowLeft, 
  faPlaneArrival,
  faPlaneDeparture,
  faLuggageCart,
  faShieldHalved
} from '@fortawesome/free-solid-svg-icons';

export default function StepTransport({ 
  fromCity = 'Delhi', 
  destination = 'Mumbai', 
  fromDate = '', 
  toDate = '', 
  outboundTransport, 
  returnTransport, 
  onSelectOutbound, 
  onSelectReturn, 
  travellers = 2,
  onNext, 
  onBack 
}) {
  const [outboundMode, setOutboundMode] = useState(outboundTransport?.type || 'flight'); // 'flight' | 'bus'
  const [returnMode, setReturnMode] = useState(returnTransport?.type || 'flight'); // 'flight' | 'bus'

  // Generate dynamic options based on cities
  const generateOutboundOptions = () => {
    if (outboundMode === 'bike') {
      return [
        { id: 'out-bk1', type: 'bike', operator: 'Personal Vehicle / Bike Ride', code: 'SELF-DRIVE', depTime: '06:00 AM', arrTime: '02:00 PM', duration: '8h 00m', price: 0, seatsLeft: 99, baggage: 'Personal Luggage' },
      ];
    } else if (outboundMode === 'flight') {
      return [
        { id: 'out-f1', type: 'flight', operator: 'IndiGo', code: '6E-2031', depTime: '06:00 AM', arrTime: '08:15 AM', duration: '2h 15m', price: 4799, seatsLeft: 5, baggage: '15kg Check-in' },
        { id: 'out-f2', type: 'flight', operator: 'Air India', code: 'AI-630', depTime: '09:30 AM', arrTime: '11:45 AM', duration: '2h 15m', price: 5899, seatsLeft: 8, baggage: '25kg Check-in' },
        { id: 'out-f3', type: 'flight', operator: 'Akasa Air', code: 'QP-1107', depTime: '02:15 PM', arrTime: '04:30 PM', duration: '2h 15m', price: 4299, seatsLeft: 3, baggage: '15kg Check-in' },
      ];
    } else {
      return [
        { id: 'out-b1', type: 'bus', operator: 'Zingbus Premium Volvo', code: 'ZB-881', depTime: '08:00 PM', arrTime: '07:00 AM (+1d)', duration: '11h 00m', price: 1499, seatsLeft: 12, baggage: '20kg Luggage' },
        { id: 'out-b2', type: 'bus', operator: 'IntrCity SmartBus AC Sleeper', code: 'IC-402', depTime: '09:30 PM', arrTime: '08:30 AM (+1d)', duration: '11h 00m', price: 1799, seatsLeft: 6, baggage: '20kg Luggage' },
        { id: 'out-b3', type: 'bus', operator: 'VRL Travels Multi-Axle Volvo', code: 'VRL-910', depTime: '07:00 PM', arrTime: '06:00 AM (+1d)', duration: '11h 00m', price: 1299, seatsLeft: 15, baggage: '20kg Luggage' },
      ];
    }
  };

  const generateReturnOptions = () => {
    if (returnMode === 'bike') {
      return [
        { id: 'ret-bk1', type: 'bike', operator: 'Personal Vehicle / Bike Ride', code: 'SELF-DRIVE', depTime: '02:00 PM', arrTime: '10:00 PM', duration: '8h 00m', price: 0, seatsLeft: 99, baggage: 'Personal Luggage' },
      ];
    } else if (returnMode === 'flight') {
      return [
        { id: 'ret-f1', type: 'flight', operator: 'IndiGo', code: '6E-5412', depTime: '05:45 PM', arrTime: '08:00 PM', duration: '2h 15m', price: 4999, seatsLeft: 7, baggage: '15kg Check-in' },
        { id: 'ret-f2', type: 'flight', operator: 'Air India', code: 'AI-803', depTime: '08:15 PM', arrTime: '10:30 PM', duration: '2h 15m', price: 6199, seatsLeft: 4, baggage: '25kg Check-in' },
        { id: 'ret-f3', type: 'flight', operator: 'SpiceJet', code: 'SG-8157', depTime: '03:30 PM', arrTime: '05:45 PM', duration: '2h 15m', price: 4399, seatsLeft: 9, baggage: '15kg Check-in' },
      ];
    } else {
      return [
        { id: 'ret-b1', type: 'bus', operator: 'IntrCity SmartBus AC Sleeper', code: 'IC-505', depTime: '07:30 PM', arrTime: '06:30 AM (+1d)', duration: '11h 00m', price: 1699, seatsLeft: 10, baggage: '20kg Luggage' },
        { id: 'ret-b2', type: 'bus', operator: 'Zingbus Luxury Volvo', code: 'ZB-992', depTime: '09:00 PM', arrTime: '08:00 AM (+1d)', duration: '11h 00m', price: 1599, seatsLeft: 14, baggage: '20kg Luggage' },
        { id: 'ret-b3', type: 'bus', operator: 'SRS Travels AC Seater/Sleeper', code: 'SRS-304', depTime: '06:00 PM', arrTime: '05:00 AM (+1d)', duration: '11h 00m', price: 1399, seatsLeft: 8, baggage: '20kg Luggage' },
      ];
    }
  };

  const outboundOptions = generateOutboundOptions();
  const returnOptions = generateReturnOptions();

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <span className="text-xs font-bold text-[#D4B15A] uppercase tracking-widest bg-[#D4B15A]/10 px-3 py-1 rounded-full border border-[#D4B15A]/20">
            Step 6: Intercity Transport Booking
          </span>
          <h2 className="text-3xl font-display font-bold text-gray-900 mt-2">
            Book Outbound & Return Tickets ({fromCity} ⇄ {destination})
          </h2>
          <p className="text-gray-500 text-xs mt-1">
            Choose your Day 1 departure travel and Last Day return travel independently.
          </p>
        </div>

        <button
          onClick={onNext}
          className="bg-[#121619] hover:bg-[#1e2429] text-[#D4B15A] font-bold px-8 py-3 rounded-xl transition-all shadow-md text-xs cursor-pointer flex items-center gap-2"
        >
          <span>Next: Review & Confirm</span>
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>

      <div className="space-y-8">
        
        {/* SECTION 1: OUTBOUND TRANSPORT */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-gray-100 pb-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-[#D4B15A] tracking-widest bg-[#D4B15A]/10 px-2.5 py-0.5 rounded-md">
                1st Day Outbound Journey
              </span>
              <h3 className="text-xl font-bold text-gray-900 mt-1 flex items-center gap-2">
                <FontAwesomeIcon icon={faPlaneDeparture} className="text-[#D4B15A]" />
                {fromCity} → {destination} ({fromDate || 'Day 1'})
              </h3>
            </div>

            {/* Mode Switch (Flight / Bus / Self Drive) */}
            <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
              <button
                onClick={() => setOutboundMode('flight')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  outboundMode === 'flight'
                    ? 'bg-[#121619] text-[#D4B15A] shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FontAwesomeIcon icon={faPlane} /> Flight
              </button>
              <button
                onClick={() => setOutboundMode('bus')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  outboundMode === 'bus'
                    ? 'bg-[#121619] text-[#D4B15A] shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FontAwesomeIcon icon={faBus} /> Bus
              </button>
              <button
                onClick={() => setOutboundMode('bike')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  outboundMode === 'bike'
                    ? 'bg-[#121619] text-[#D4B15A] shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🏍️ Self Drive / Bike
              </button>
            </div>
          </div>

          {/* Outbound Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {outboundOptions.map(opt => {
              const isSelected = outboundTransport?.id === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => onSelectOutbound(opt)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#D4B15A] bg-amber-500/5 ring-2 ring-[#D4B15A]/30 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-gray-900 text-sm">{opt.operator}</span>
                      <span className="text-[10px] text-gray-400 font-mono">{opt.code}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-800 mb-1">
                      <span>{opt.depTime}</span>
                      <span className="text-gray-400 font-normal">→</span>
                      <span>{opt.arrTime}</span>
                    </div>
                    <p className="text-[11px] text-gray-500">Duration: {opt.duration} • {opt.baggage}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                    <div>
                      <span className="text-base font-extrabold text-gray-900">₹{opt.price.toLocaleString()}</span>
                      <span className="text-[10px] text-gray-400 block">per person</span>
                    </div>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                      isSelected ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                      <FontAwesomeIcon icon={faCheck} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: RETURN TRANSPORT */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-gray-100 pb-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-[#D4B15A] tracking-widest bg-[#D4B15A]/10 px-2.5 py-0.5 rounded-md">
                Last Day Return Journey
              </span>
              <h3 className="text-xl font-bold text-gray-900 mt-1 flex items-center gap-2">
                <FontAwesomeIcon icon={faPlaneArrival} className="text-[#D4B15A]" />
                {destination} → {fromCity} ({toDate || 'Last Day'})
              </h3>
            </div>

            {/* Mode Switch (Flight / Bus / Self Drive) */}
            <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
              <button
                onClick={() => setReturnMode('flight')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  returnMode === 'flight'
                    ? 'bg-[#121619] text-[#D4B15A] shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FontAwesomeIcon icon={faPlane} /> Flight
              </button>
              <button
                onClick={() => setReturnMode('bus')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  returnMode === 'bus'
                    ? 'bg-[#121619] text-[#D4B15A] shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FontAwesomeIcon icon={faBus} /> Bus
              </button>
              <button
                onClick={() => setReturnMode('bike')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  returnMode === 'bike'
                    ? 'bg-[#121619] text-[#D4B15A] shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🏍️ Self Drive / Bike
              </button>
            </div>
          </div>

          {/* Return Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {returnOptions.map(opt => {
              const isSelected = returnTransport?.id === opt.id;
              return (
                <div
                  key={opt.id}
                  className={`bg-gray-50 p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#D4B15A] ring-2 ring-[#D4B15A]/30 bg-amber-500/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-gray-900">{opt.operator}</span>
                      <span className="text-[10px] text-gray-400 font-mono">{opt.code}</span>
                    </div>

                    <div className="flex justify-between items-center my-3 bg-white p-2.5 rounded-xl border border-gray-100">
                      <div>
                        <span className="text-base font-extrabold text-gray-900 block">{opt.depTime}</span>
                        <span className="text-[10px] text-gray-400 font-semibold">{destination}</span>
                      </div>

                      <div className="text-center px-2">
                        <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1 justify-center">
                          <FontAwesomeIcon icon={faClock} className="text-[#D4B15A]" /> {opt.duration}
                        </span>
                        <div className="w-16 h-0.5 bg-gray-300 my-1 relative">
                          <div className="w-1.5 h-1.5 bg-[#D4B15A] rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-extrabold text-gray-900 block">{opt.arrTime}</span>
                        <span className="text-[10px] text-gray-400 font-semibold">{fromCity}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gray-500 mb-3">
                      <span className="flex items-center gap-1"><FontAwesomeIcon icon={faLuggageCart} /> {opt.baggage}</span>
                      <span className="text-emerald-600 font-semibold">{opt.seatsLeft} seats left</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-gray-400 block font-medium">Per seat</span>
                      <span className="text-lg font-extrabold text-gray-900">₹{opt.price.toLocaleString()}</span>
                    </div>

                    <button
                      onClick={() => onSelectReturn(opt)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#121619] text-[#D4B15A] hover:bg-[#1e2429]'
                      }`}
                    >
                      {isSelected ? <><FontAwesomeIcon icon={faCheck} /> Selected</> : 'Select Ticket'}
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Bottom Nav */}
      <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-200">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Back to Dining
        </button>

        <button
          onClick={onNext}
          className="px-8 py-3 bg-[#121619] hover:bg-[#1e2429] text-[#D4B15A] font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
        >
          <span>Review & Confirm</span>
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>

    </div>
  );
}

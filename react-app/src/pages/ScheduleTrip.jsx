import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWandMagicSparkles, faMapLocationDot, faCalendarAlt, faCarSide, faWallet, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { generateTripPlan } from '../services/gemini';
import useAppStore from '../stores/useAppStore';
import TripOutput from '../components/planner/TripOutput';
import DraftHistory from '../components/planner/DraftHistory';

export default function ScheduleTrip() {
  const [params, setParams] = useState({ locations: '', fromDate: '', toDate: '', mode: 'Bus / Coach', budget: 'balanced' });
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [apiError, setApiError] = useState(null);
  const { addToast, addDraft } = useAppStore();

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPlan(null);
    setApiError(null);
    try {
      const locList = params.locations.split(',').map(s => s.trim()).filter(Boolean);
      const generated = await generateTripPlan({
        locations: locList,
        fromDate: params.fromDate,
        toDate: params.toDate,
        mode: params.mode,
        budget: params.budget
      });

      if (generated.error) {
        setApiError(generated.error);
        addToast({ type: 'error', message: generated.error });
      } else {
        setPlan(generated);
        addDraft({ params, plan: generated, date: new Date().toISOString() });
        addToast({ type: 'success', title: 'Plan Generated!', message: 'Your AI trip is ready.' });
      }
    } catch (err) {
      setApiError(err.message);
      addToast({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        
        {!plan && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 shadow-xl max-w-4xl mx-auto mb-10"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-tr from-[#121619] to-[#1e2429] rounded-2xl flex items-center justify-center mx-auto mb-4 text-white text-2xl shadow-lg">
                <FontAwesomeIcon icon={faWandMagicSparkles} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 font-display">AI Trip Planner</h2>
              <p className="text-gray-500 mt-2">Let our AI build your perfect itinerary in 60 seconds.</p>
            </div>

            {/* API Error Banner */}
            {apiError && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-5">
                <div className="flex gap-3 items-start">
                  <span className="text-red-500 text-xl mt-0.5">⚠️</span>
                  <div>
                    <p className="font-bold text-red-800 mb-1">Itinerary Generation Failed</p>
                    <p className="text-red-700 text-sm">{apiError}</p>
                    {apiError.includes('API key') && (
                      <div className="mt-3 bg-white rounded-xl p-4 border border-red-100 text-sm">
                        <p className="font-bold text-gray-800 mb-2">🔑 How to fix: Get a valid Gemini API key</p>
                        <ol className="list-decimal list-inside space-y-1 text-gray-600">
                          <li>Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-blue-600 underline">Google AI Studio</a> and create a free API key</li>
                          <li>Open <code className="bg-gray-100 px-1 rounded">react-app/.env</code> and update: <code className="bg-gray-100 px-1 rounded">VITE_GEMINI_API_KEY=AIza...</code></li>
                          <li>Restart the dev server with <code className="bg-gray-100 px-1 rounded">npm run dev</code></li>
                        </ol>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Where do you want to go?</label>
                <div className="relative">
                  <FontAwesomeIcon icon={faMapLocationDot} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" required className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#121619] focus:ring-1 focus:ring-[#121619] outline-none" placeholder="e.g. Manali, Shimla, Kasol" value={params.locations} onChange={e => setParams({...params, locations: e.target.value})} />
                </div>
                <p className="text-xs text-gray-400 mt-1">Comma separated list of cities/places</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                <div className="relative">
                  <FontAwesomeIcon icon={faCalendarAlt} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="date" required className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#121619] focus:ring-1 focus:ring-[#121619] outline-none" value={params.fromDate} onChange={e => setParams({...params, fromDate: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                <div className="relative">
                  <FontAwesomeIcon icon={faCalendarAlt} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="date" required className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#121619] focus:ring-1 focus:ring-[#121619] outline-none" value={params.toDate} onChange={e => setParams({...params, toDate: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Travel Mode</label>
                <div className="relative">
                  <FontAwesomeIcon icon={faCarSide} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#121619] focus:ring-1 focus:ring-[#121619] outline-none appearance-none" value={params.mode} onChange={e => setParams({...params, mode: e.target.value})}>
                    <option value="Bus">Bus / Coach</option>
                    <option value="Flight">Flight</option>
                    <option value="Train">Train</option>
                    <option value="Car">Personal/Rental Car</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget Level</label>
                <div className="relative">
                  <FontAwesomeIcon icon={faWallet} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#121619] focus:ring-1 focus:ring-[#121619] outline-none appearance-none" value={params.budget} onChange={e => setParams({...params, budget: e.target.value})}>
                    <option value="budget">Backpacker / Budget</option>
                    <option value="balanced">Balanced / Standard</option>
                    <option value="comfort">Comfort / Luxury</option>
                  </select>
                </div>
              </div>

              <div className="md:col-span-2 mt-4">
                <button type="submit" disabled={loading} className="w-full bg-[#121619] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#1e2429] transition-colors shadow-lg shadow-[#121619]/30 disabled:bg-gray-400 flex items-center justify-center gap-2">
                  {loading ? <><FontAwesomeIcon icon={faSpinner} spin /> Generating...</> : <><FontAwesomeIcon icon={faWandMagicSparkles} /> Generate Itinerary</>}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {plan && (
            <motion.div
              key="plan"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex justify-between items-center mb-6 max-w-5xl mx-auto">
                <h3 className="text-2xl font-bold text-gray-900 font-display">Your AI Itinerary</h3>
                <button onClick={() => setPlan(null)} className="text-[#121619] font-medium hover:underline">
                  Start Over
                </button>
              </div>
              <TripOutput plan={plan} setPlan={setPlan} />
            </motion.div>
          )}
        </AnimatePresence>
        
        {!plan && <DraftHistory onSelectDraft={(draft) => { setParams(draft.params); setPlan(draft.plan); }} />}

      </div>
    </div>
  );
}

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faEdit, faCheckCircle, faSpinner, faPrint } from '@fortawesome/free-solid-svg-icons';
import { redraftTripPlan } from '../../services/gemini';
import useAppStore from '../../stores/useAppStore';
import TripPDFDocument from './TripPDFDocument';

export default function TripOutput({ plan, setPlan }) {
  const [isEditing, setIsEditing] = useState(false);
  const [instruction, setInstruction] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useAppStore();
  const printRef = useRef();

  if (!plan) return null;

  const handleRedraft = async () => {
    if (!instruction) return;
    setLoading(true);
    try {
      const updated = await redraftTripPlan(plan, instruction);
      if (updated.error) {
        addToast({ type: 'error', message: updated.error });
      } else {
        setPlan(updated);
        addToast({ type: 'success', message: 'Itinerary updated based on your instructions.' });
        setIsEditing(false);
        setInstruction('');
      }
    } catch (err) {
      addToast({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Action Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center justify-between no-print">
        <div className="flex items-center gap-2">
          <button onClick={() => setIsEditing(!isEditing)} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 flex items-center gap-2">
            <FontAwesomeIcon icon={faEdit} /> Redraft
          </button>
          <button onClick={handlePrint} className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg font-medium hover:bg-gray-100 flex items-center gap-2">
            <FontAwesomeIcon icon={faPrint} /> Print / PDF
          </button>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Est. Budget</p>
          <p className="font-bold text-gray-900">
            ₹{(plan.estimated_budget_inr?.min || plan.estimatedBudget?.min)?.toLocaleString()} - ₹{(plan.estimated_budget_inr?.max || plan.estimatedBudget?.max)?.toLocaleString()}
          </p>
        </div>
      </div>

      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden no-print"
          >
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-6">
              <h4 className="font-bold text-blue-900 mb-2">Refine Itinerary with AI</h4>
              <p className="text-sm text-blue-700 mb-4">Tell us what to change (e.g., "Make it more relaxed", "Add more food options", "Swap day 1 and 2")</p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={instruction}
                  onChange={e => setInstruction(e.target.value)}
                  placeholder="Your instructions..."
                  className="flex-1 px-4 py-2 rounded-xl border border-blue-200 outline-none focus:ring-2 ring-blue-400"
                />
                <button 
                  onClick={handleRedraft}
                  disabled={loading || !instruction}
                  className="bg-blue-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-blue-700 disabled:bg-blue-400"
                >
                  {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Apply'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Printable Area */}
      <div ref={printRef} className="bg-white rounded-3xl p-8 shadow-xl print:shadow-none print:p-0">
        <TripPDFDocument plan={plan} />
      </div>

    </div>
  );
}

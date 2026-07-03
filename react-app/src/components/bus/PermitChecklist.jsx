import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faCheckCircle, faExclamationCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { generatePermitChecklist } from '../../services/gemini';

export default function PermitChecklist({ mode, from, to }) {
  const [checklist, setChecklist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadChecklist() {
      setLoading(true);
      setError(null);
      try {
        const data = await generatePermitChecklist(mode, from, to);
        setChecklist(data);
      } catch (err) {
        setError("Could not load permit checklist at this time.");
      } finally {
        setLoading(false);
      }
    }
    if (from && to) {
      loadChecklist();
    }
  }, [mode, from, to]);

  if (!from || !to) return null;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <FontAwesomeIcon icon={faFileAlt} className="text-[#121619]" /> Travel Documents Checklist
      </h3>
      
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <FontAwesomeIcon icon={faSpinner} spin className="text-2xl text-[#121619]" />
          <span className="ml-3 text-gray-500">Generating AI checklist for your route...</span>
        </div>
      ) : error ? (
        <div className="text-red-500 p-4 bg-red-50 rounded-xl flex items-start gap-3">
          <FontAwesomeIcon icon={faExclamationCircle} className="mt-1" />
          <p>{error}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {checklist.map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-4 rounded-xl border ${item.required ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}
            >
              <div className="flex items-start gap-3">
                <FontAwesomeIcon 
                  icon={item.required ? faExclamationCircle : faCheckCircle} 
                  className={`mt-1 ${item.required ? 'text-red-500' : 'text-emerald-500'}`} 
                />
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {item.item}
                    {item.required && <span className="ml-2 text-[10px] uppercase tracking-wider bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">Required</span>}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  {item.tip && (
                    <div className="text-xs text-[#121619] bg-blue-50 mt-2 p-2 rounded-lg font-medium inline-block border border-blue-100">
                      💡 Tip: {item.tip}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory, faChevronRight, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import useAppStore from '../../stores/useAppStore';

export default function DraftHistory({ onSelectDraft }) {
  const { draftHistory } = useAppStore();

  if (!draftHistory || draftHistory.length === 0) return null;

  return (
    <div className="max-w-4xl mx-auto mt-12">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <FontAwesomeIcon icon={faHistory} className="text-gray-400" /> Recent Drafts
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {draftHistory.map((draft, i) => {
          const date = new Date(draft.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => onSelectDraft(draft)}
              className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md cursor-pointer transition-all group"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="text-xs text-gray-400">{date}</div>
                <FontAwesomeIcon icon={faChevronRight} className="text-gray-300 group-hover:text-[#121619] transition-colors" />
              </div>
              <h4 className="font-bold text-gray-900 line-clamp-1 mb-1">{draft.plan?.title || 'Trip Plan'}</h4>
              <p className="text-sm text-gray-500 flex items-center gap-1 line-clamp-1">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-xs" /> {draft.params?.locations}
              </p>
              <div className="mt-3 flex gap-2">
                <span className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{draft.params?.mode}</span>
                <span className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-md capitalize">{draft.params?.budget}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

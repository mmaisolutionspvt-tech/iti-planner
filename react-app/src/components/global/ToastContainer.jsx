import { AnimatePresence, motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faCircleExclamation, faCircleInfo, faCoins } from '@fortawesome/free-solid-svg-icons';
import useAppStore from '../../stores/useAppStore';

const ICONS = {
  success: { icon: faCircleCheck, color: 'text-emerald-400' },
  error: { icon: faCircleExclamation, color: 'text-red-400' },
  info: { icon: faCircleInfo, color: 'text-blue-400' },
  coins: { icon: faCoins, color: 'text-yellow-400' },
};

export default function ToastContainer() {
  const { toasts } = useAppStore();

  return (
    <div className="fixed bottom-4 right-4 z-[90] flex flex-col gap-2 max-w-sm">
      <AnimatePresence>
        {toasts.map(toast => {
          const style = ICONS[toast.type] || ICONS.info;
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              className="bg-gray-900/95 backdrop-blur-lg border border-white/10 rounded-xl p-4 shadow-2xl flex items-start gap-3"
            >
              <FontAwesomeIcon icon={style.icon} className={`${style.color} text-lg mt-0.5`} />
              <div>
                {toast.title && <p className="text-white font-semibold text-sm">{toast.title}</p>}
                <p className="text-white/70 text-sm">{toast.message}</p>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

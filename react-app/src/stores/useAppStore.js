import { create } from 'zustand';

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('Storage write failed:', e);
  }
}

const useAppStore = create((set, get) => ({
  // Sidebar State
  isSidebarOpen: false,
  openSidebar: () => set({ isSidebarOpen: true }),
  closeSidebar: () => set({ isSidebarOpen: false }),

  // Auth Modal State
  isLoginModalOpen: false,
  openLoginModal: () => set({ isLoginModalOpen: true }),
  closeLoginModal: () => set({ isLoginModalOpen: false }),

  // User
  user: loadFromStorage('firstflight_user', null),
  travelCoins: loadFromStorage('ff_travel_coins', 0),
  welcomed: !!localStorage.getItem('welcomed'),

  setUser: (user) => {
    saveToStorage('firstflight_user', user);
    set({ user });
  },

  setWelcomed: () => {
    localStorage.setItem('welcomed', 'true');
    set({ welcomed: true });
  },

  addCoins: (amount) => {
    const newTotal = get().travelCoins + amount;
    saveToStorage('ff_travel_coins', newTotal);
    set({ travelCoins: newTotal });
  },

  // Saved Trips
  savedTrips: loadFromStorage('ff_saved_trips', []),
  saveTrip: (trip) => {
    const updated = [...get().savedTrips, { ...trip, id: Date.now(), savedAt: new Date().toISOString() }];
    saveToStorage('ff_saved_trips', updated);
    set({ savedTrips: updated });
  },
  removeTrip: (id) => {
    const updated = get().savedTrips.filter(t => t.id !== id);
    saveToStorage('ff_saved_trips', updated);
    set({ savedTrips: updated });
  },

  // Draft History (keep last 2)
  draftHistory: loadFromStorage('ff_draft_history', []),
  addDraft: (draft) => {
    const history = [draft, ...get().draftHistory].slice(0, 2);
    saveToStorage('ff_draft_history', history);
    set({ draftHistory: history });
  },

  // Toasts
  toasts: [],
  addToast: (toast) => {
    const id = Date.now();
    set({ toasts: [...get().toasts, { ...toast, id }] });
    setTimeout(() => {
      set({ toasts: get().toasts.filter(t => t.id !== id) });
    }, toast.duration || 4000);
  },
}));

export default useAppStore;

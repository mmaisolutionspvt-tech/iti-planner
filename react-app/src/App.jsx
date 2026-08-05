import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import WelcomeModal from './components/global/WelcomeModal';
import { ToastContainer as ReactToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ToastContainer from './components/global/ToastContainer';
import LoginModal from './components/global/LoginModal';
import useAppStore from './stores/useAppStore';
import Home from './pages/Home';
import BookBus from './pages/BookBus';
import BookFlight from './pages/BookFlight';
import ScheduleTrip from './pages/ScheduleTrip';
import Locations from './pages/Locations';
import Packages from './pages/Packages';
import MyTrips from './pages/MyTrips';
import About from './pages/About';
import Contact from './pages/Contact';
import Register from './pages/Register';

// New features
import BookingGrid from './pages/BookingGrid';
import WeatherDiagnostics from './pages/WeatherDiagnostics';
import SelectHotel from './pages/SelectHotel';

// Placeholder components for routing before they are built
const Placeholder = ({ title }) => <div className="pt-24 min-h-screen text-center"><h1 className="text-3xl font-bold">{title} Page</h1></div>;

export default function App() {
  const { isLoginModalOpen, closeLoginModal } = useAppStore();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/locations" element={<Locations />} />
          <Route path="/packages" element={<Packages />} />
          <Route path="/my-trips" element={<MyTrips />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/book-bus" element={<BookBus />} />
          <Route path="/book-flight" element={<BookFlight />} />
          <Route path="/schedule-trip" element={<ScheduleTrip />} />
          <Route path="/register" element={<Register />} />
          <Route path="/select-hotel" element={<SelectHotel />} />
          <Route path="/booking-grid" element={<BookingGrid />} />
          <Route path="/weather-diagnostics" element={<WeatherDiagnostics />} />
          <Route path="*" element={<Placeholder title="404 Not Found" />} />
        </Routes>
      </main>
      <Footer />
      <WelcomeModal />
      <ToastContainer />
      <ReactToastContainer position="bottom-right" autoClose={4000} />
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
    </div>
  );
}

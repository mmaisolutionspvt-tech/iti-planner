import { SignIn, SignUp, useUser } from '@clerk/clerk-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Register() {
  const [isLogin, setIsLogin] = useState(true);
  const { isSignedIn } = useUser();

  if (isSignedIn) {
    return (
      <div className="pt-32 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md w-full">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">You are signed in!</h2>
          <p className="text-gray-500 mb-6">Welcome to Firstflight Travels.</p>
          <a href="/" className="bg-[#121619] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#1e2429] transition-colors inline-block w-full">
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-gray-50 pb-20 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        
        <div className="text-center mb-8">
          <img src="/files/logo.png" alt="Logo" className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 font-display">
            {isLogin ? 'Welcome Back' : 'Create an Account'}
          </h1>
          <p className="text-gray-500 mt-2">
            {isLogin ? 'Sign in to access your saved trips and bookings' : 'Join Firstflight to start planning smarter'}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 min-h-[500px] flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? 'login' : 'register'}
              initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
              className="w-full flex justify-center"
            >
              {isLogin ? (
                <SignIn routing="hash" />
              ) : (
                <SignUp routing="hash" />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="text-center mt-6">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-[#121619] font-medium hover:underline"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>

      </div>
    </div>
  );
}

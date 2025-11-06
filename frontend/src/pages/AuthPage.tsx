import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import LoginForm from "../components/auth/LoginForm";
import SignUpForm from "../components/auth/SignUpForm";
import HomeHeroGraphic from "../components/heroGraphics"; 

export default function AuthPage() {
  const [isLoginView, setIsLoginView] = useState(true);

  const formVariants = {
    initial: { opacity: 0, y: 25 },
    animate: { opacity: 2, y: 0 },
    exit: { opacity: 0, y: -25 },
  };

  return (
    <section className="h-screen w-full bg-[#0a1a33] font-poppins text-white grid grid-cols-1 md:grid-cols-2 overflow-hidden">
      <div className="hidden md:flex flex-col items-center justify-center p-12 bg-gradient-to-br from-[#0a1a33] to-[#1a2f55]">
        <div className="w-full max-w-md">
          <HomeHeroGraphic />
        </div>
      </div>

      <div className="flex flex-col items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="flex justify-center border-b border-[#1e3a61] mb-8">
            <button
              onClick={() => setIsLoginView(true)}
              className={`w-1/2 py-3 font-semibold text-lg transition-colors ${
                isLoginView
                  ? "text-[#5ea4ff] border-b-2 border-[#5ea4ff]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLoginView(false)}
              className={`w-1/2 py-3 font-semibold text-lg transition-colors ${
                !isLoginView
                  ? "text-[#5ea4ff] border-b-2 border-[#5ea4ff]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Sign Up
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={isLoginView ? "login" : "signup"}
              variants={formVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              {isLoginView ? <LoginForm /> : <SignUpForm />}
            </motion.div>
          </AnimatePresence>

          <p className="text-center text-gray-400 text-sm mt-8">
            {isLoginView
              ? "Don't have an account?"
              : "Already have an account?"}
            <button
              onClick={() => setIsLoginView(!isLoginView)}
              className="font-semibold text-[#5ea4ff] hover:underline ml-2"
            >
              {isLoginView ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </section>
  );
}

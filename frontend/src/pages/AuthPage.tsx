import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import LoginForm from "../components/auth/LoginForm";
import SignUpForm from "../components/auth/SignUpForm";
import HomeHeroGraphic from "../components/heroGraphics";

const formVariants = {
  initial: { opacity: 0, y: 25 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -25 },
};

export default function AuthPage() {
  const [isLoginView, setIsLoginView] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  // Simulate login submission
  const handleLoginSubmit = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      // simulate async login API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      alert("Logged in successfully!");
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Simulate signup submission
  const handleSignUpSubmit = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      // simulate async signup API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      alert("Signed up successfully!");
    } catch (error) {
      console.error("Sign up failed:", error);
      alert("Sign up failed.");
    } finally {
      setLoading(false);
    }
  }, []);

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
              disabled={loading}
              className={`w-1/2 py-3 font-semibold text-lg transition-colors ${
                isLoginView
                  ? "text-[#5ea4ff] border-b-2 border-[#5ea4ff]"
                  : "text-gray-400 hover:text-white"
              } ${loading ? "cursor-not-allowed opacity-50" : ""}`}
              aria-pressed={isLoginView}
              aria-disabled={loading}
              type="button"
            >
              Login
            </button>
            <button
              onClick={() => setIsLoginView(false)}
              disabled={loading}
              className={`w-1/2 py-3 font-semibold text-lg transition-colors ${
                !isLoginView
                  ? "text-[#5ea4ff] border-b-2 border-[#5ea4ff]"
                  : "text-gray-400 hover:text-white"
              } ${loading ? "cursor-not-allowed opacity-50" : ""}`}
              aria-pressed={!isLoginView}
              aria-disabled={loading}
              type="button"
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
              {isLoginView ? (
                <LoginForm onSubmit={handleLoginSubmit} loading={loading} />
              ) : (
                <SignUpForm onSubmit={handleSignUpSubmit} loading={loading} />
              )}
            </motion.div>
          </AnimatePresence>

          <p className="text-center text-gray-400 text-sm mt-8 select-none">
            {isLoginView ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => setIsLoginView(!isLoginView)}
              disabled={loading}
              className={`font-semibold text-[#5ea4ff] hover:underline ml-2 ${
                loading ? "cursor-not-allowed" : ""
              }`}
              aria-pressed={!isLoginView}
              aria-disabled={loading}
              type="button"
            >
              {isLoginView ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </section>
  );
}

import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function ErrorFallback() {
  const location = useLocation();
  const navigate = useNavigate();

  const message =
    (location.state as { message?: string } | null)?.message ??
    "Something went wrong. Please try again.";

  useEffect(() => {
    toast.error(message);
  }, [message]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#061228] text-[#d0e7ff] font-poppins px-6">
      <div className="max-w-lg w-full bg-[#0a1f3d] border border-[#1f3f6b] rounded-2xl shadow-2xl p-10 text-center space-y-6">
        <div className="text-6xl">⚠️</div>
        <h1 className="text-3xl font-semibold">Oops! Something Broke.</h1>
        <p className="text-base leading-relaxed opacity-90">{message}</p>

        <button
          onClick={() => navigate(-1)}
          className="w-full rounded-xl bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] py-3 font-semibold text-white transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[#5ea4ff]/80"
        >
          Go Back
        </button>
        <button
          onClick={() => navigate("/home")}
          className="w-full rounded-xl border border-[#5ea4ff]/40 py-3 font-semibold text-[#5ea4ff] transition hover:bg-[#112a4f]"
        >
          Return Home
        </button>
      </div>
    </main>
  );
}


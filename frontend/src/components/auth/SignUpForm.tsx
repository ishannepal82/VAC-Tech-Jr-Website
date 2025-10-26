import { User, Mail, Lock } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import { toast } from "sonner";

export default function SignUpForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!username) newErrors.username = "Username is required.";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      newErrors.email = "Email is required.";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long.";
    } else if (
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)
    ) {
      newErrors.password =
        "Password needs an uppercase, lowercase, number, and special character.";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async(e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Invalid Information", {
        description: "Please correct the highlighted fields and try again.",
      });
      return;
    }

    try{
      setLoading(true);
      const res = await fetch("http://127.0.0.1:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      if (!res.ok){
        setLoading(false);
        if (res.status == 500){
          toast.error("Internal Server Error, Please try loggin in again!");
        }
        if (res.status == 401) {
          toast.error("Invalid Credentials, Make Sure You Have Signed Up!");
        }
        if (res.status == 404) {
          toast.error("User Not Found, Make Sure You Have Signed Up!");
        }
        if (res.status == 409) {
          toast.error("User Already Exists with the email provided, Try Loggin in!");
        }
        console.log('Error Fetching Data:', res);
        return;
      }

      const data = await res.json();
      console.log(data);
      toast.success("Account Created Successfully! Login to Gain Access to the app");
      setLoading(false);
    }

    catch (e) {
      setLoading(false)
      console.log('Error Found while Fetching User data', e);
      return;
    }
  }

    

  return (
    <div>
      <h2 className="text-3xl font-bold text-center text-[#9cc9ff] mb-8">
        Create an Account
      </h2>
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div className="relative">
          <User
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-[#1e3a61] border border-transparent rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5ea4ff]"
          />
          {errors.username && (
            <p className="text-red-400 text-sm mt-1 ml-2">{errors.username}</p>
          )}
        </div>

        <div className="relative">
          <Mail
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#1e3a61] border border-transparent rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5ea4ff]"
          />
          {errors.email && (
            <p className="text-red-400 text-sm mt-1 ml-2">{errors.email}</p>
          )}
        </div>

        <div className="relative">
          <Lock
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#1e3a61] border border-transparent rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5ea4ff]"
          />
          {errors.password && (
            <p className="text-red-400 text-sm mt-1 ml-2">{errors.password}</p>
          )}
        </div>

        <div className="relative">
          <Lock
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-[#1e3a61] border border-transparent rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5ea4ff]"
          />
          {errors.confirmPassword && (
            <p className="text-red-400 text-sm mt-1 ml-2">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-8 py-3 rounded-lg font-semibold transition !mt-6"
          disabled={loading}
        >
          {loading ? "Loading..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
}

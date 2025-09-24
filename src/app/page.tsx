"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface LoginData {
  email: string;
  password: string;
}

const AdminLogin = () => {
  const router = useRouter();
  const [loginData, setLoginData] = useState<LoginData>({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { data } = await axios.post("http://localhost:8000/api/login", loginData);

      if (data.success) {
        const user = data.data.user;
        const token = data.data.token;

        localStorage.setItem("admin_user", JSON.stringify(user));
        localStorage.setItem("admin_token", token);

        router.push("/Dashboard");
      } else {
        setError(data.message || "Email atau password salah!");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-orange-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-blue-100">
          <div className="bg-gradient-to-r from-blue-100 to-orange-100 p-6 text-center">
            <div className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6l1 9H8l1-9zM8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M5 7h14" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-800 mb-1">POS & Inventory</h1>
            <p className="text-sm text-gray-600">Management System</p>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  className="w-full px-3 py-2.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-colors bg-white text-black placeholder-gray-400"
                  placeholder="Enter email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="w-full px-3 py-2.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-colors bg-white text-black placeholder-gray-400"
                  placeholder="Enter password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-400 to-orange-300 text-white py-2.5 rounded-lg font-medium hover:from-blue-500 hover:to-orange-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md mt-6"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Login...
                  </div>
                ) : (
                  "Login"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import FullPageLoader from "../../Preloader/FullPageLoader";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface User {
  id: number;
  email: string;
  role: string;
  last_active_at: string;
  created_at: string;
  admin?: {
    adminId: number;
    name: string;
    phone: string;
  };
}

const AllUser: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL + "/people/allPeople"; 
  const token = localStorage.getItem("admin_token");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers(res.data.data.allPeople || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Gagal memuat user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <FullPageLoader message="Memuat data user..." />;

  return (
    <div className="p-6">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Daftar User</h2>
            <p className="text-sm text-gray-600 mt-1">
              Semua user terdaftar dalam sistem
            </p>
          </div>

          <div className="overflow-x-auto p-6">
            {users.length === 0 ? (
              <p className="text-gray-500">Belum ada user.</p>
            ) : (
              <table className="w-full table-auto border-collapse border border-gray-300 text-left">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2">ID</th>
                    <th className="border border-gray-300 px-4 py-2">Nama</th>
                    <th className="border border-gray-300 px-4 py-2">Email</th>
                    <th className="border border-gray-300 px-4 py-2">Role</th>
                    <th className="border border-gray-300 px-4 py-2">
                      No. HP
                    </th>
                    <th className="border border-gray-300 px-4 py-2">
                      Terakhir Aktif
                    </th>
                    <th className="border border-gray-300 px-4 py-2">
                      Dibuat
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">
                        {user.id}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {user.admin?.name || "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {user.email}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {user.role}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {user.admin?.phone || "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {user.last_active_at || "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {new Date(user.created_at).toLocaleDateString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllUser;

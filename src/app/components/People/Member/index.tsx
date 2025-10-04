"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import FullPageLoader from "../../Preloader/FullPageLoader";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Region {
  regionId: number;
  code: string;
  name: string;
}

interface Member {
  memberId: number;
  memberCode: string;
  nik: string;
  name: string;
  phone: string;
  address: string;
  region: Region;
  points: string;
}

const AllMember: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL + "/people/member";
  const token = localStorage.getItem("admin_token");

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMembers(res.data.data.member || []);
    } catch (error) {
      console.error("Error fetching members:", error);
      toast.error("Gagal memuat member");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  if (loading) return <FullPageLoader message="Memuat data member..." />;

  return (
    <div className="p-6">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Daftar Member</h2>
            <p className="text-sm text-gray-600 mt-1">
              Semua member terdaftar dalam sistem
            </p>
          </div>

          <div className="overflow-x-auto p-6">
            {members.length === 0 ? (
              <p className="text-gray-500">Belum ada member.</p>
            ) : (
              <table className="w-full table-auto border-collapse border border-gray-300 text-left">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="border border-gray-300 px-4 py-2">Kode</th>
                    <th className="border border-gray-300 px-4 py-2">Region</th>
                    <th className="border border-gray-300 px-4 py-2">Nama</th>
                    <th className="border border-gray-300 px-4 py-2">NIK</th>
                    <th className="border border-gray-300 px-4 py-2">No. HP</th>
                    <th className="border border-gray-300 px-4 py-2">Alamat</th>
                    <th className="border border-gray-300 px-4 py-2">Point Member</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr key={m.memberId} className="hover:bg-gray-50 text-gray-700">
                      <td className="border border-gray-300 px-4 py-2">{m.memberCode}</td>
                      <td className="border border-gray-300 px-4 py-2">{m.region?.name || "-"} ({m.region?.code})</td>
                      <td className="border border-gray-300 px-4 py-2">{m.name}</td>
                      <td className="border border-gray-300 px-4 py-2">{m.nik}</td>
                      <td className="border border-gray-300 px-4 py-2">{m.phone}</td>
                      <td className="border border-gray-300 px-4 py-2">{m.address}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        {Math.floor(parseFloat(m.points))}
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

export default AllMember;

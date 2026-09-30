import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Building2, Activity, ArrowRight, Search, Stethoscope, Sparkles } from 'lucide-react';
import api from '@/lib/axios';

interface Department {
  _id: string;
  name: string;
  bnName?: string;
  description?: string;
  isActive: boolean;
}

export const DepartmentListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch Active Departments
  const { data: departments, isLoading } = useQuery<Department[]>({
    queryKey: ['public-departments-page'],
    queryFn: async () => {
      const res = await api.get('/departments?active=true');
      return res.data.data;
    },
  });

  const filteredDepartments = React.useMemo(() => {
    if (!departments) return [];
    if (!searchTerm.trim()) return departments;
    return departments.filter(
      (d) =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.bnName && d.bnName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (d.description && d.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [departments, searchTerm]);

  return (
    <div className="min-h-screen bg-[#f8fafc] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner */}
        <div className="bg-brand-gradient rounded-3xl p-6 sm:p-8 text-white mb-8 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Specialized Clinical Units
            </span>
            <h1 className="text-2xl sm:text-3xl font-black mt-2">Medical Departments & Specialties</h1>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1">
              Explore our specialized medical consultation departments and modern clinical facilities.
            </p>
          </div>
          <Link
            to="/doctors"
            className="bg-white hover:bg-slate-100 text-[#00984a] font-black text-xs px-5 py-2.5 rounded-2xl shadow transition shrink-0"
          >
            Find Doctor by Specialty
          </Link>
        </div>

        {/* Search Filter */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm mb-8">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search department by name or specialty (e.g. Cardiology, Neurology, হৃদরোগ)..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00984a]"
            />
          </div>
        </div>

        {/* Departments Grid */}
        {isLoading ? (
          <div className="text-center py-20 text-xs text-slate-400">Loading medical departments...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDepartments.length > 0 ? (
              filteredDepartments.map((dept) => (
                <div
                  key={dept._id}
                  className="bg-white rounded-3xl border-2 border-slate-100 p-6 shadow-sm hover:shadow-xl hover:border-[#00984a] transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#00984a] group-hover:bg-[#00984a] group-hover:text-white transition-all duration-300 flex items-center justify-center shadow-sm">
                        <Activity className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Active Unit
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-lg group-hover:text-[#00984a] transition leading-snug">
                      {dept.name}
                    </h3>
                    
                    {dept.bnName && (
                      <p className="text-xs font-bold text-emerald-800 mt-1">
                        {dept.bnName}
                      </p>
                    )}

                    <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                      {dept.description || 'Specialized diagnostic consultations, clinical care, and expert treatment solutions.'}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">Specialist Panel</span>
                    <Link
                      to={`/doctors?departmentId=${dept._id}`}
                      className="inline-flex items-center gap-1 text-xs font-black text-[#00984a] group-hover:translate-x-1 transition"
                    >
                      <span>View Doctors</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs">
                No medical departments found matching your search.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
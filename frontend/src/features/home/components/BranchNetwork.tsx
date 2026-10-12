import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Clock, ArrowRight, Building } from 'lucide-react';

export const BranchNetwork: React.FC = () => {
  const branches = [
    {
      name: 'Dhanmondi (Main Complex)',
      address: 'House #16, Road #2, Dhanmondi R/A, Dhaka-1205',
      phone: '09666 787801, 09613 787801',
      timing: '24 Hours Open',
    },
    {
      name: 'English Road Branch',
      address: 'House #2, English Road, Ray Saheb Bazar, Dhaka',
      phone: '09666 787802, 09613 787802',
      timing: '7:00 AM - 11:00 PM',
    },
    {
      name: 'Shantinagar Branch',
      address: 'Unit #1 & 2, Shantinagar Mor, Dhaka-1217',
      phone: '09666 787803, 09613 787803',
      timing: '7:00 AM - 11:00 PM',
    },
    {
      name: 'Uttara Branch (Unit 1 & 2)',
      address: 'House #21, Road #7, Sector #3, Uttara, Dhaka',
      phone: '09666 787805, 09613 787805',
      timing: '7:00 AM - 11:00 PM',
    },
    {
      name: 'Chattogram Branch',
      address: '20/B, K.B. Fazlul Kader Road, Panchlaish, Chattogram',
      phone: '09666 787810, 09613 787810',
      timing: '7:00 AM - 11:00 PM',
    },
    {
      name: 'Sylhet Branch',
      address: 'Subhanighat, New Medical Road, Sylhet',
      phone: '09666 787812, 09613 787812',
      timing: '7:00 AM - 11:00 PM',
    },
  ];

  return (
    <section className="py-16 bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400 bg-teal-950 px-3 py-1 rounded-full border border-teal-800">
              Countrywide Branches
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
              Our Nationwide Diagnostic Branches
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Visit your nearest Care Point branch for diagnostic tests and specialist doctor appointments.
            </p>
          </div>
          <Link to="/branches" className="mt-4 md:mt-0 text-teal-400 font-bold text-xs hover:underline flex items-center gap-1">
            View All 18 Branches <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((branch, idx) => (
            <div key={idx} className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 hover:border-teal-500/60 transition">
              <div className="flex items-center gap-2 mb-3">
                <Building className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-white text-sm">{branch.name}</h3>
              </div>
              <div className="space-y-2 text-xs text-slate-300">
                <p className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span>{branch.address}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-bold text-white">{branch.phone}</span>
                </p>
                <p className="flex items-center gap-2 text-slate-400">
                  <Clock className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>{branch.timing}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
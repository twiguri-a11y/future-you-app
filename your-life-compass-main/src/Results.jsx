import React from 'react';

const Results = ({ mood, goal }) => {
  return (
    <div className="min-h-screen bg-[#F2F2F2] flex items-center justify-center p-6">
      <div className="max-auto max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border-t-8 border-[#F28C28]">
        <div className="p-8 text-center">
          <h2 className="text-[#1A2B3C] text-3xl font-bold mb-4">Your Vision is Ready</h2>
          <p className="text-gray-600 mb-8">Based on your focus today, here is the person you are becoming:</p>
          
          <div className="bg-[#1A2B3C] rounded-xl p-6 mb-8 transform hover:scale-105 transition-transform">
            <h3 className="text-[#F28C28] text-xl font-bold uppercase tracking-widest mb-2">The Future You</h3>
            <p className="text-white text-2xl font-light italic">
              "A <span className="font-bold text-[#F28C28]">{mood || 'Happy'}</span> and <span className="font-bold text-[#F28C28]">{goal || 'Confident'}</span> leader who inspires others."
            </p>
          </div>

          <button 
            className="w-full bg-[#F28C28] hover:bg-[#d97a1f] text-white font-bold py-4 rounded-lg transition-colors shadow-lg"
            onClick={() => window.location.reload()}
          >
            Start New Journey
          </button>
        </div>
      </div>
    </div>
  );
};

export default Results;
import React, { useState } from 'react';
import { CheckSquare, ListChecks, ArrowLeft, Check, BookOpen, AlertCircle } from 'lucide-react';

interface ChecklistViewProps {
  onBackToLobby: () => void;
}

export const ChecklistView: React.FC<ChecklistViewProps> = ({ onBackToLobby }) => {
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});

  const checklistSections = [
    {
      title: 'Content & Research (70% Weight - Part 1.2 & Part 7)',
      items: [
        { id: 'c1', text: 'I know the topic and have 3–4 structured points ready before speaking' },
        { id: 'c2', text: 'I have at least 1–2 concrete data points, metrics, or company examples' },
        { id: 'c3', text: 'I presented multiple dimensions (PESTEL: economic, social, regulatory)' },
        { id: 'c4', text: 'My arguments connect cause and effect rather than superficial opinions' }
      ]
    },
    {
      title: 'Active Listening & Group Management (30% Weight - Part 7)',
      items: [
        { id: 'l1', text: 'I built directly on at least 2 peers’ points instead of isolated talking' },
        { id: 'l2', text: 'I actively invited a quieter member into the floor (e.g. "I’d love to hear from Ananya")' },
        { id: 'l3', text: 'I did not aggressively interrupt peers; I reclaimed the floor politely' },
        { id: 'l4', text: 'I helped the group reach consensus and summarized before closing' }
      ]
    },
    {
      title: 'Delivery, Tone & Body Language (Rule 10 & Part 5)',
      items: [
        { id: 'd1', text: 'I spoke at a calm, deliberate pace without shouting' },
        { id: 'd2', text: 'I used minimal to zero vocal fillers (um, uh, like, you know < 2/min)' },
        { id: 'd3', text: 'I entered the discussion early within the first 60–90 seconds' },
        { id: 'd4', text: 'I kept my individual speech turns to 30–45 seconds' },
        { id: 'd5', text: 'I stayed composed under challenge and avoided defensive arguments' }
      ]
    }
  ];

  const totalItems = checklistSections.reduce((sum, s) => sum + s.items.length, 0);
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const progressPercent = Math.round((checkedCount / totalItems) * 100);

  const toggleItem = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-600" />
            <span>IIM & Recruiter 15-Point Pre/Post GD Checklist (Part 7 & 10)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Research-validated self-assessment checklist from institutional evaluation rubrics.
          </p>
        </div>

        <button
          onClick={onBackToLobby}
          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-sm flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Arena</span>
        </button>
      </div>

      {/* Progress Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-bold text-slate-800">
            Checklist Readiness: {checkedCount} / {totalItems} Criteria Checked
          </div>
          <div className="text-[11px] text-slate-500">
            {progressPercent >= 80 ? '🎯 Excellent readiness for IIM and Day-1 placement panels!' : 'Review before clicking Launch Discussion Round.'}
          </div>
        </div>

        <div className="w-32 bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
          <div
            className="bg-indigo-600 h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Checklist Sections */}
      <div className="space-y-4">
        {checklistSections.map((section, sIdx) => (
          <div key={sIdx} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
              <span>{section.title}</span>
            </h3>

            <div className="space-y-2 pt-1">
              {section.items.map(item => {
                const isChecked = Boolean(checkedItems[item.id]);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-indigo-50/50 border-indigo-200 text-slate-900'
                        : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="text-xs leading-relaxed select-none">{item.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

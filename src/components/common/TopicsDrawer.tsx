import React, { useState } from 'react';
import { BookOpen, Check, Search, Filter } from 'lucide-react';
import { GDTopic } from '../../types/gd';
import { TOPIC_COLLECTION } from '../../data/topics';

interface TopicsDrawerProps {
  onSelectTopic: (topic: GDTopic) => void;
  selectedTopicId?: string;
}

export const TopicsDrawer: React.FC<TopicsDrawerProps> = ({ onSelectTopic, selectedTopicId }) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Placement Classic', 'Tech & AI', 'Case Study', 'Controversial', 'Abstract'];

  const filtered = TOPIC_COLLECTION.filter(t => {
    const matchesCat = activeCategory === 'All' || t.category === activeCategory;
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                          t.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <span>Placement Topic Library (Spec Part N)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Curated discussion prompts covering Economic, Technological, Political, Case Study, and Abstract categories.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search topics..."
            className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-1.5">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
              activeCategory === cat
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filtered.map((topic) => {
          const isSelected = selectedTopicId === topic.id;
          return (
            <div
              key={topic.id}
              onClick={() => onSelectTopic(topic)}
              className={`bg-white border rounded-lg p-4 cursor-pointer transition-all hover:border-slate-300 shadow-sm ${
                isSelected ? 'border-indigo-600 bg-indigo-50/20 ring-1 ring-indigo-500/30' : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                  {topic.category}
                </span>
                {isSelected && (
                  <span className="text-[11px] font-bold text-indigo-600 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Selected
                  </span>
                )}
              </div>
              <h3 className="text-xs font-bold text-slate-900 leading-snug">{topic.title}</h3>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{topic.description}</p>
              
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span>Suggested Duration: {topic.suggestedDurationMins || 6} Mins</span>
                <span className="text-indigo-600 font-semibold hover:underline">Select for Session &rarr;</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

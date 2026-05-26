import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, BookOpen, Star, Trash2, Search, Tag } from 'lucide-react';
import { useStore } from '../../store/useStore';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import { Input, Textarea, Select } from '../shared/Input';
import { uuid } from '../../utils/uuid';
import type { Strategy } from '../../types';

const CATEGORIES = ['Sales', 'Marketing', 'Operations', 'Hiring', 'Productivity', 'Leadership', 'Customer Growth', 'Personal Development'];

const CATEGORY_COLORS: Record<string, string> = {
  Sales: '#10b981',
  Marketing: '#f59e0b',
  Operations: '#3b82f6',
  Hiring: '#8b5cf6',
  Productivity: '#06b6d4',
  Leadership: '#ec4899',
  'Customer Growth': '#f97316',
  'Personal Development': '#6366f1',
};

export default function StrategyVault() {
  const { state, addStrategy, updateStrategy, deleteStrategy } = useStore();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<Strategy | null>(null);
  const [form, setForm] = useState({ title: '', category: 'Sales', notes: '', tags: '' });

  const categories = ['All', ...CATEGORIES];

  const filtered = state.strategies.filter(s => {
    const matchCat = activeCategory === 'All' || s.category === activeCategory;
    const matchSearch = !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.notes.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const submit = () => {
    const strategy: Strategy = {
      id: uuid(), title: form.title, category: form.category,
      notes: form.notes, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      createdAt: new Date().toISOString(), isFavorite: false,
    };
    addStrategy(strategy);
    setShowAdd(false);
    setForm({ title: '', category: 'Sales', notes: '', tags: '' });
  };

  const toggleFave = (s: Strategy) => updateStrategy(s.id, { isFavorite: !s.isFavorite });

  return (
    <div className="space-y-4 pb-2">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Strategy Vault</h2>
          <p className="text-xs text-gray-500 mt-0.5">{state.strategies.length} strategies stored</p>
        </div>
        <Button onClick={() => setShowAdd(true)} size="sm" className="flex items-center gap-1.5">
          <Plus size={14} /> New Strategy
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/40"
          placeholder="Search strategies..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-select">
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all"
            style={{
              background: activeCategory === cat ? (CATEGORY_COLORS[cat] || '#3b82f6') + '22' : 'rgba(255,255,255,0.05)',
              color: activeCategory === cat ? (CATEGORY_COLORS[cat] || '#3b82f6') : '#9ca3af',
              border: `1px solid ${activeCategory === cat ? (CATEGORY_COLORS[cat] || '#3b82f6') + '44' : 'transparent'}`,
            }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Strategies Grid */}
      <div className="space-y-3">
        {filtered.map((strategy, i) => (
          <motion.div key={strategy.id} layout
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="glass rounded-2xl p-4 cursor-pointer"
            style={{ background: 'var(--bg-card-alt)', border: '1px solid rgba(255,255,255,0.06)' }}
            onClick={() => setSelected(strategy)}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: `${CATEGORY_COLORS[strategy.category] || '#3b82f6'}20`, color: CATEGORY_COLORS[strategy.category] || '#3b82f6' }}>
                    {strategy.category}
                  </span>
                  {strategy.isFavorite && <Star size={11} className="text-yellow-400 fill-yellow-400" />}
                </div>
                <h3 className="font-semibold text-white text-sm">{strategy.title}</h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{strategy.notes}</p>
                {strategy.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    {strategy.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="flex items-center gap-1 text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                        <Tag size={8} /> {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <button onClick={e => { e.stopPropagation(); toggleFave(strategy); }}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-all">
                  <Star size={14} className={strategy.isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} />
                </button>
                <button onClick={e => { e.stopPropagation(); deleteStrategy(strategy.id); }}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-all">
                  <Trash2 size={14} className="text-gray-600" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-8 text-center"
            style={{ background: 'var(--bg-card-empty)', border: '1px dashed rgba(255,255,255,0.08)' }}>
            <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4"
              style={{ background: 'rgba(139,92,246,0.1)' }}>
              <BookOpen size={26} className="text-purple-400" />
            </div>
            {search || activeCategory !== 'All' ? (
              <>
                <p className="text-white font-semibold text-base">No results found.</p>
                <p className="text-gray-500 text-sm mt-1.5">Try adjusting your search or filter.</p>
              </>
            ) : (
              <>
                <p className="text-white font-semibold text-base">Your playbook is empty.</p>
                <p className="text-gray-500 text-sm mt-1.5 leading-relaxed max-w-xs mx-auto">
                  Store your best scripts, systems, and ideas here. Every winning business runs on documented strategies.
                </p>
                <Button onClick={() => setShowAdd(true)} className="mt-5 flex items-center gap-2 mx-auto" size="md">
                  <Plus size={15} /> Save First Strategy
                </Button>
              </>
            )}
          </motion.div>
        )}
      </div>

      {/* Add Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="New Strategy">
        <div className="space-y-4">
          <Input label="Title" placeholder="e.g. Cold Outreach Script" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <Select label="Category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Textarea label="Notes / Content" placeholder="Write your strategy, script, or system here..." rows={6} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          <Input label="Tags (comma separated)" placeholder="script, phone, outreach" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
          <Button onClick={submit} disabled={!form.title} className="w-full">Save Strategy</Button>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.title}>
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: `${CATEGORY_COLORS[selected.category]}20`, color: CATEGORY_COLORS[selected.category] }}>
                {selected.category}
              </span>
              <span className="text-xs text-gray-500">{new Date(selected.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="p-4 rounded-xl text-sm text-gray-300 leading-relaxed whitespace-pre-wrap"
              style={{ background: 'var(--bg-card-inner)' }}>
              {selected.notes}
            </div>
            {selected.tags.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {selected.tags.map(t => (
                  <span key={t} className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">{t}</span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={() => toggleFave(selected)} variant="secondary" className="flex-1">
                {selected.isFavorite ? '★ Unfavorite' : '☆ Favorite'}
              </Button>
              <Button onClick={() => { deleteStrategy(selected.id); setSelected(null); }} variant="danger" className="flex-1">Delete</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

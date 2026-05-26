import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { useStore } from '../../store/useStore';
import ProgressBar from '../shared/ProgressBar';
import Modal from '../shared/Modal';
import type { Badge } from '../../types';

const RARITY_STYLES = {
  common: { color: '#9ca3af', label: 'Common', border: 'rgba(156,163,175,0.2)' },
  rare: { color: '#3b82f6', label: 'Rare', border: 'rgba(59,130,246,0.3)' },
  epic: { color: '#8b5cf6', label: 'Epic', border: 'rgba(139,92,246,0.4)' },
  legendary: { color: '#f59e0b', label: 'Legendary', border: 'rgba(245,158,11,0.5)' },
};

function BadgeGlowClass(rarity: string, unlocked: boolean) {
  if (!unlocked) return '';
  if (rarity === 'legendary') return 'badge-legendary';
  if (rarity === 'epic') return 'badge-epic';
  if (rarity === 'rare') return 'badge-rare';
  return '';
}

export default function Badges() {
  const { state } = useStore();
  const [selected, setSelected] = useState<Badge | null>(null);

  const unlocked = state.badges.filter(b => b.unlocked);
  const locked = state.badges.filter(b => !b.unlocked);

  return (
    <div className="space-y-4 pb-2">
      <div>
        <h2 className="text-xl font-bold text-white">Badges & Milestones</h2>
        <p className="text-xs text-gray-500 mt-0.5">{unlocked.length}/{state.badges.length} unlocked</p>
      </div>

      {/* Progress */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-white">Collection Progress</span>
          <span className="text-sm font-bold text-blue-400">{unlocked.length}/{state.badges.length}</span>
        </div>
        <ProgressBar value={unlocked.length} max={state.badges.length} />

        <div className="grid grid-cols-4 gap-2 mt-4">
          {Object.entries(RARITY_STYLES).map(([rarity, style]) => {
            const count = state.badges.filter(b => b.rarity === rarity && b.unlocked).length;
            return (
              <div key={rarity} className="text-center p-2 rounded-xl" style={{ background: `${style.color}12` }}>
                <p className="text-lg font-bold" style={{ color: style.color }}>{count}</p>
                <p className="text-[9px] text-gray-500 capitalize">{style.label}</p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Unlocked Badges */}
      {unlocked.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Unlocked</h3>
          <div className="grid grid-cols-3 gap-3">
            {unlocked.map((badge, i) => {
              const style = RARITY_STYLES[badge.rarity];
              return (
                <motion.button key={badge.id} layout
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}
                  onClick={() => setSelected(badge)} whileTap={{ scale: 0.95 }}
                  className={`glass rounded-2xl p-4 flex flex-col items-center gap-2 ${BadgeGlowClass(badge.rarity, badge.unlocked)}`}
                  style={{ background: `${style.color}10`, border: `1px solid ${style.border}` }}>
                  <span className="text-3xl">{badge.icon}</span>
                  <div className="text-center">
                    <p className="text-[11px] font-bold text-white leading-tight">{badge.name}</p>
                    <p className="text-[9px] mt-0.5 capitalize font-semibold" style={{ color: style.color }}>{style.label}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Locked Badges */}
      {locked.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Locked</h3>
          <div className="space-y-2">
            {locked.map((badge, i) => {
              const style = RARITY_STYLES[badge.rarity];
              const progress = badge.progress || 0;
              const target = badge.target || 1;

              return (
                <motion.button key={badge.id} layout
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  onClick={() => setSelected(badge)} whileTap={{ scale: 0.98 }}
                  className="w-full glass rounded-xl p-3 flex items-center gap-3 text-left"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <span className="text-2xl opacity-40">{badge.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-sm font-semibold text-gray-400">{badge.name}</p>
                      <span className="text-[10px] capitalize font-bold" style={{ color: style.color }}>{style.label}</span>
                    </div>
                    <p className="text-xs text-gray-600 truncate">{badge.description}</p>
                    {target > 1 && (
                      <div className="flex items-center gap-2 mt-1.5">
                        <ProgressBar value={progress} max={target} height={3} color={style.color} />
                        <span className="text-[10px] text-gray-600 shrink-0">{progress}/{target}</span>
                      </div>
                    )}
                  </div>
                  <Lock size={14} className="text-gray-600 shrink-0" />
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Badge Detail Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)}>
        {selected && (() => {
          const style = RARITY_STYLES[selected.rarity];
          return (
            <div className="text-center space-y-4">
              <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mx-auto text-5xl ${BadgeGlowClass(selected.rarity, selected.unlocked)}`}
                style={{ background: `${style.color}15`, border: `2px solid ${style.color}40` }}>
                {selected.unlocked ? selected.icon : '🔒'}
              </div>
              <div>
                <p className="text-xl font-bold text-white">{selected.name}</p>
                <p className="text-sm capitalize font-semibold mt-1" style={{ color: style.color }}>{style.label} Badge</p>
                <p className="text-sm text-gray-400 mt-2">{selected.description}</p>
              </div>
              {selected.unlocked && selected.unlockedAt && (
                <div className="p-3 rounded-xl" style={{ background: `${style.color}10` }}>
                  <p className="text-xs text-gray-400">Unlocked on</p>
                  <p className="text-sm font-semibold" style={{ color: style.color }}>
                    {new Date(selected.unlockedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              )}
              {!selected.unlocked && selected.target && selected.target > 1 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Progress</span>
                    <span>{selected.progress || 0}/{selected.target}</span>
                  </div>
                  <ProgressBar value={selected.progress || 0} max={selected.target} color={style.color} />
                </div>
              )}
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}

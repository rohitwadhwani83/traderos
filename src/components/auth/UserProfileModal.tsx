import React from 'react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import {
  User as UserIcon,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  LogOut,
  Wallet,
  Coins,
  Settings,
  Flame,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToSettings?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  onNavigateToSettings,
}) => {
  const { currentUser, user, isDemoMode, setDemoMode, logout } = useAuth();
  const profileUser = currentUser || user;

  const initials = profileUser.name
    ? profileUser.name
        .split(' ')
        .map((p) => p[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'TR';

  const memberSince = profileUser.createdAt
    ? new Date(profileUser.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : '2026';

  const disclaimerDate = profileUser.disclaimerAcceptedAt
    ? new Date(profileUser.disclaimerAcceptedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Acknowledged';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="TraderOS Account"
      subtitle="Your active trading profile and security credentials"
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* User Identity Card */}
        <div className="p-4 rounded-xl bg-[#090d16] border border-slate-800 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-base shadow-md">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white truncate">{profileUser.name}</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[10px] font-semibold text-emerald-400">
                Active Trader
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate mt-0.5">{profileUser.email}</p>
          </div>
        </div>

        {/* Credentials & Verification Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Mobile Number with OTP Verification Badge */}
          <div className="p-3 rounded-xl bg-[#111624] border border-slate-800">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-indigo-400" />
                <span>Mobile Number</span>
              </span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Verified</span>
              </span>
            </div>
            <p className="text-xs font-semibold text-white font-mono">
              {profileUser.mobileNumber || '+91 98765 43210'}
            </p>
          </div>

          {/* Email Address */}
          <div className="p-3 rounded-xl bg-[#111624] border border-slate-800">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span>Email Address</span>
              </span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Verified</span>
              </span>
            </div>
            <p className="text-xs font-semibold text-white truncate font-mono">
              {profileUser.email}
            </p>
          </div>

          {/* SEBI Compliance Status */}
          <div className="p-3 rounded-xl bg-[#111624] border border-slate-800">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Risk Disclaimer</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-medium">Signed</span>
            </div>
            <p className="text-xs font-semibold text-white">
              SEBI Notice Accepted • <span className="text-slate-400 text-[11px]">{disclaimerDate}</span>
            </p>
          </div>

          {/* Member Since */}
          <div className="p-3 rounded-xl bg-[#111624] border border-slate-800">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>Member Since</span>
              </span>
            </div>
            <p className="text-xs font-semibold text-white">{memberSince}</p>
          </div>
        </div>

        {/* Current Active Mode */}
        <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Active Trading Mode</span>
            <span className="font-semibold text-white flex items-center gap-1.5 mt-0.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isDemoMode ? 'bg-amber-400' : 'bg-indigo-400 animate-pulse'
                }`}
              />
              {isDemoMode ? 'Demo Mode (Simulated Dataset)' : 'Personal Live Journal (My Data)'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setDemoMode(!isDemoMode)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            {isDemoMode ? 'Switch to My Data' : 'Switch to Demo'}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
          {onNavigateToSettings && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateToSettings();
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              <span>Settings</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              onClose();
              logout();
            }}
            className="flex-1 py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-300 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Undo2, Redo2, Download, Eye, Sparkles, RefreshCw, FileImage } from 'lucide-react';
import { CanvasRatio } from '../types';

interface NavbarProps {
  appName: string;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onExport: (format: 'png' | 'jpeg') => void;
  isExporting: boolean;
  ratio: CanvasRatio;
  onChangeRatio: (ratio: CanvasRatio) => void;
  onReset: () => void;
  onAutoMatchTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  appName,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onExport,
  isExporting,
  ratio,
  onChangeRatio,
  onReset,
  onAutoMatchTheme,
}) => {
  return (
    <header className="h-14 border-b border-[#2a2a2c] bg-[#161618] px-6 flex items-center justify-between shadow-lg select-none sticky top-0 z-50 text-[#e1e1e1]">
      {/* Brand & Title */}
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center font-bold text-white italic text-lg shadow-md">
          ব
        </div>
        <div>
          <span className="font-semibold text-sm tracking-tight text-[#e1e1e1]">
            {appName} <span className="text-[#666] ml-2 text-xs">v2.4.0</span>
          </span>
          <p className="text-[10px] text-[#888] font-medium leading-none mt-0.5">প্রফেশনাল বাংলা নিউজ কার্ড এডিটর</p>
        </div>
      </div>

      {/* Editor State Controllers (Undo, Redo, Reset) */}
      <div className="flex items-center gap-1.5 bg-[#2a2a2c] p-1 rounded-lg border border-[#3a3a3c]/40">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`p-1.5 px-2.5 text-xs font-semibold rounded transition-all ${
            canUndo 
              ? 'text-[#e1e1e1] hover:bg-[#3a3a3c] active:scale-95 cursor-pointer' 
              : 'text-[#666] opacity-40 cursor-not-allowed'
          }`}
          title="পূর্বাবস্থায় ফিরুন (Undo)"
        >
          <span className="flex items-center gap-1">
            <Undo2 size={13} />
            <span className="hidden md:inline">Undo</span>
          </span>
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`p-1.5 px-2.5 text-xs font-semibold rounded transition-all ${
            canRedo 
              ? 'text-[#e1e1e1] hover:bg-[#3a3a3c] active:scale-95 cursor-pointer' 
              : 'text-[#666] opacity-40 cursor-not-allowed'
          }`}
          title="পুনরায় করুন (Redo)"
        >
          <span className="flex items-center gap-1">
            <Redo2 size={13} />
            <span className="hidden md:inline">Redo</span>
          </span>
        </button>
        <div className="w-[1px] h-4 bg-[#3a3a3c] self-center" />
        <button
          onClick={onReset}
          className="p-1.5 px-2 rounded hover:text-red-500 hover:bg-[#3a3a3c] transition-all active:scale-95 text-xs flex items-center gap-1 cursor-pointer text-[#888]"
          title="ডিজাইন রিসেট করুন"
        >
          <RefreshCw size={12} />
          <span className="hidden sm:inline font-semibold">রিসেট</span>
        </button>
      </div>

      {/* Aspects Ratios & Actions */}
      <div className="flex items-center gap-3">
        {/* Aspect Ratio Selector */}
        <div className="flex items-center gap-1 bg-[#2a2a2c] p-0.5 rounded-lg border border-[#3a3a3c]/30">
          {(['1:1', '4:5', '9:16', '16:9'] as CanvasRatio[]).map((r) => (
            <button
              key={r}
              onClick={() => onChangeRatio(r)}
              className={`px-2 py-1 text-[11px] font-semibold rounded transition-all cursor-pointer ${
                ratio === r
                  ? 'bg-red-600 text-white shadow'
                  : 'text-[#888] hover:text-[#e1e1e1] hover:bg-[#3a3a3c]'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Dynamic Color Matcher */}
        <button
          onClick={onAutoMatchTheme}
          className="hidden lg:flex items-center gap-2 bg-[#2a2a2c] text-[#e1e1e1] border border-[#3a3a3c] px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#3a3a3c] transition-all active:scale-95 cursor-pointer"
          title="এক ক্লিকে লেখার কালার মেলান"
        >
          <Sparkles size={13} className="text-red-500" />
          <span>থিম ম্যাচ</span>
        </button>

        {/* Export Dropdown */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onExport('png')}
            disabled={isExporting}
            className={`flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded text-xs font-semibold hover:bg-red-700 cursor-pointer shadow-lg active:scale-95 transition-all ${
              isExporting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isExporting ? (
              <RefreshCw size={13} className="animate-spin" />
            ) : (
              <Download size={13} />
            )}
            <span>{isExporting ? 'তৈরী হচ্ছে...' : 'Export PNG'}</span>
          </button>
          
          <button
            onClick={() => onExport('jpeg')}
            disabled={isExporting}
            className={`hidden sm:flex items-center gap-1.5 bg-[#2a2a2c] text-[#e1e1e1] hover:bg-[#3a3a3c] px-3 py-2 rounded text-xs font-semibold transition-all border border-[#3a3a3c] active:scale-95 cursor-pointer ${
              isExporting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            title="Export JPG"
          >
            <FileImage size={13} />
            <span>JPG</span>
          </button>
        </div>
      </div>
    </header>
  );
};

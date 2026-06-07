/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  LayoutTemplate, PlusCircle, Paintbrush, Layers, 
  Trash2, Copy, Lock, Unlock, Eye, EyeOff, 
  ChevronUp, ChevronDown, Type, Image, Square, 
  Circle, HelpCircle, Sparkles, Check
} from 'lucide-react';
import { CanvasElement, PresetTemplate, PresetTheme, ShapeType, CanvasRatio } from '../types';
import { PRESET_THEMES, PRESET_BACKGROUND_IMAGES, BANGLA_FONTS } from '../data';

interface SidebarProps {
  templates: PresetTemplate[];
  activeTemplateId: string;
  onSelectTemplate: (templateId: string) => void;
  
  canvasBg: string;
  canvasBgType: 'solid' | 'gradient';
  canvasGradient?: string;
  canvasTexture: string;
  onChangeBg: (bg: string, type: 'solid' | 'gradient', gradient?: string) => void;
  onChangeTexture: (texture: string) => void;
  
  elements: CanvasElement[];
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onAddElement: (type: 'text' | 'image' | 'badge' | 'shape', shapeType?: ShapeType) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  onToggleLock: (id: string) => void;
  onToggleVisible: (id: string) => void;
  onMoveLayer: (id: string, direction: 'up' | 'down') => void;
  
  onApplyTheme: (theme: PresetTheme) => void;
}

type TabType = 'templates' | 'elements' | 'theme' | 'layers';

const GRADIENT_PRESETS = [
  { name: 'ব্রেকিং রেডিয়েন্ট', value: 'linear-gradient(135deg, #EF4444 0%, #7F1D1D 100%)' },
  { name: 'রয়্যাল ডার্ক', value: 'linear-gradient(135deg, #0F172A 0%, #020617 100%)' },
  { name: 'স্পোর্টস স্প্ল্যাশ', value: 'linear-gradient(135deg, #10B981 0%, #064E3B 100%)' },
  { name: 'মহাসাগর নীল', value: 'linear-gradient(135deg, #1D4ED8 0%, #172554 100%)' },
  { name: 'কোরাল সানসেট', value: 'linear-gradient(135deg, #F97316 0%, #7C2D12 100%)' },
  { name: 'সফট গ্লসি গ্রীড', value: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)' },
  { name: 'এলিট পার্পল', value: 'linear-gradient(135deg, #7C3AED 0%, #2E1065 100%)' },
  { name: 'মডার্ন রোজ', value: 'linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  templates,
  activeTemplateId,
  onSelectTemplate,
  canvasBg,
  canvasBgType,
  canvasGradient,
  canvasTexture,
  onChangeBg,
  onChangeTexture,
  elements,
  selectedElementId,
  onSelectElement,
  onAddElement,
  onDeleteElement,
  onDuplicateElement,
  onToggleLock,
  onToggleVisible,
  onMoveLayer,
  onApplyTheme,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('templates');
  const [customSolidBg, setCustomSolidBg] = useState(canvasBgType === 'solid' ? canvasBg : '#FFFFFF');

  const handleSolidBgChange = (color: string) => {
    setCustomSolidBg(color);
    onChangeBg(color, 'solid');
  };

  return (
    <aside className="w-80 bg-[#161618] border-r border-[#2a2a2c] flex flex-col h-full text-[#e1e1e1] select-none shrink-0">
      {/* Sidebar Tab Buttons */}
      <div className="flex bg-[#0f0f10] border-b border-[#2a2a2c] p-1">
        <button
          onClick={() => setActiveTab('templates')}
          className={`flex-1 py-2 flex flex-col items-center gap-1 rounded text-[10px] font-semibold tracking-wider uppercase transition-all cursor-pointer ${
            activeTab === 'templates' 
              ? 'bg-[#2a2a2c] text-white border border-[#2a2a2c] shadow' 
              : 'text-[#666] hover:text-[#e1e1e1] hover:bg-[#2a2a2c]/40'
          }`}
        >
          <LayoutTemplate size={15} className={activeTab === 'templates' ? 'text-red-500' : ''} />
          <span>টেমপ্লেট</span>
        </button>
        <button
          onClick={() => setActiveTab('elements')}
          className={`flex-1 py-2 flex flex-col items-center gap-1 rounded text-[10px] font-semibold tracking-wider uppercase transition-all cursor-pointer ${
            activeTab === 'elements' 
              ? 'bg-[#2a2a2c] text-white border border-[#2a2a2c] shadow' 
              : 'text-[#666] hover:text-[#e1e1e1] hover:bg-[#2a2a2c]/40'
          }`}
        >
          <PlusCircle size={15} className={activeTab === 'elements' ? 'text-red-500' : ''} />
          <span>যোগ করুন</span>
        </button>
        <button
          onClick={() => setActiveTab('theme')}
          className={`flex-1 py-2 flex flex-col items-center gap-1 rounded text-[10px] font-semibold tracking-wider uppercase transition-all cursor-pointer ${
            activeTab === 'theme' 
              ? 'bg-[#2a2a2c] text-white border border-[#2a2a2c] shadow' 
              : 'text-[#666] hover:text-[#e1e1e1] hover:bg-[#2a2a2c]/40'
          }`}
        >
          <Paintbrush size={15} className={activeTab === 'theme' ? 'text-red-500' : ''} />
          <span>ব্যাকগ্রাউন্ড</span>
        </button>
        <button
          onClick={() => setActiveTab('layers')}
          className={`flex-1 py-2 flex flex-col items-center gap-1 rounded text-[10px] font-semibold tracking-wider uppercase transition-all cursor-pointer ${
            activeTab === 'layers' 
              ? 'bg-[#2a2a2c] text-white border border-[#2a2a2c] shadow' 
              : 'text-[#666] hover:text-[#e1e1e1] hover:bg-[#2a2a2c]/40'
          }`}
        >
          <div className="relative">
            <Layers size={15} className={activeTab === 'layers' ? 'text-red-500' : ''} />
            <span className="absolute -top-1 -right-2 bg-red-600 text-white font-mono text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center scale-90">
              {elements.length}
            </span>
          </div>
          <span>লেয়ার</span>
        </button>
      </div>

      {/* Tab Contents Panels */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {/* TAB 1: TEMPLATE LIST */}
        {activeTab === 'templates' && (
          <div className="space-y-4">
            <div className="pb-2 border-b border-[#2a2a2c]">
              <h3 className="text-xs font-bold text-[#e1e1e1] uppercase tracking-wider">রেডিমেড নিউজ টেমপ্লেট</h3>
              <p className="text-[10px] text-[#666] mt-1">ক্যানভাস ডিজাইনের দ্রুততম যাত্রার জন্য যেকোনো একটি লেআউট নির্বাচন করুন:</p>
            </div>
            
            <div className="grid grid-cols-1 gap-3.5">
              {templates.map((template) => {
                const isActive = template.id === activeTemplateId;
                return (
                  <button
                    key={template.id}
                    onClick={() => {
                      onSelectTemplate(template.id);
                    }}
                    className={`group text-left p-3.5 rounded border transition-all duration-200 cursor-pointer ${
                      isActive 
                        ? 'bg-red-500/10 border-red-600 shadow-md' 
                        : 'bg-[#2a2a2c] border-[#2a2a2c] hover:border-[#3a3a3c] hover:bg-[#323235]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-semibold text-[13px] text-[#e1e1e1] group-hover:text-white transition-all flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse inline-block" />
                        {template.bengaliName}
                      </div>
                      <span className="text-[9px] bg-[#0f0f10] text-[#888] px-2 py-0.5 rounded font-mono border border-[#2a2a2c] leading-none">
                        {template.ratio === '1:1' ? 'বর্গক্ষেত্রের (১:১)' : 'পোর্ট্রেট (৪:৫)'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#888] mt-1.5 line-clamp-2 leading-relaxed">
                      {template.description}
                    </p>
                    <div className="mt-3 flex items-center gap-1 text-[10px] text-red-500 font-semibold">
                      <span>সম্পাদনা শুরু করুন</span>
                      <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: ADD ELEMENTS */}
        {activeTab === 'elements' && (
          <div className="space-y-5">
            <div className="pb-1 border-b border-[#2a2a2c]">
              <h3 className="text-xs font-bold text-[#e1e1e1] uppercase tracking-wider">নতুন এলিমেন্ট যোগ করুন</h3>
              <p className="text-[10px] text-[#666] mt-1">আপনার পোস্টার ডিজাইনকে সমৃদ্ধ করতে নতুন অবজেক্ট যোগ করুন:</p>
            </div>

            <div className="space-y-3.5">
              {/* Text Block Adders */}
              <div className="space-y-2">
                <span className="text-[10px] text-[#666] font-bold uppercase tracking-wider block">১. টাইপোগ্রাফি (Bangla Text)</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onAddElement('text')}
                    className="bg-[#2a2a2c] hover:bg-[#323235] border border-[#2a2a2c] hover:border-[#3a3a3c] py-3 px-2.5 rounded text-white text-xs font-semibold flex items-center gap-2 justify-center transition-all active:scale-95 cursor-pointer"
                  >
                    <Type size={14} className="text-red-500" />
                    <span>নতুন লিখা</span>
                  </button>
                  <button
                    onClick={() => onAddElement('badge')}
                    className="bg-[#2a2a2c] hover:bg-[#323235] border border-[#2a2a2c] hover:border-[#3a3a3c] py-3 px-2.5 rounded text-white text-xs font-semibold flex items-center gap-2 justify-center transition-all active:scale-95 cursor-pointer"
                  >
                    <Sparkles size={14} className="text-amber-500" />
                    <span>স্ট্যাটাস ব্যাজ</span>
                  </button>
                </div>
              </div>

              {/* Graphic Shapes */}
              <div className="space-y-2 pt-1">
                <span className="text-[10px] text-[#666] font-bold uppercase tracking-wider block">২. জ্যামিতিক শেপ ও স্ট্রাইপ</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onAddElement('shape', 'rectangle')}
                    className="bg-[#2a2a2c] hover:bg-[#323235] border border-[#2a2a2c] hover:border-[#3a3a3c] py-3 px-2 rounded text-white text-[11px] font-semibold flex items-center gap-1.5 justify-center transition-all active:scale-95 cursor-pointer"
                  >
                    <Square size={13} className="text-blue-500" />
                    <span>চৌকোণা বক্স</span>
                  </button>
                  <button
                    onClick={() => onAddElement('shape', 'circle')}
                    className="bg-[#2a2a2c] hover:bg-[#323235] border border-[#2a2a2c] hover:border-[#3a3a3c] py-3 px-2 rounded text-white text-[11px] font-semibold flex items-center gap-1.5 justify-center transition-all active:scale-95 cursor-pointer"
                  >
                    <Circle size={13} className="text-emerald-500" />
                    <span>বৃত্তাকার শেপ</span>
                  </button>
                  <button
                    onClick={() => onAddElement('shape', 'line')}
                    className="bg-[#2a2a2c] hover:bg-[#323235] border border-[#2a2a2c] hover:border-[#3a3a3c] py-3 px-2 rounded text-white text-[11px] font-semibold flex items-center gap-1.5 justify-center transition-all active:scale-95 cursor-pointer"
                  >
                    <span className="inline-block w-4 h-0.5 bg-yellow-500 rounded" />
                    <span>লাইন ডিভাইডার</span>
                  </button>
                  <button
                    onClick={() => onAddElement('shape', 'ribbon')}
                    className="bg-[#2a2a2c] hover:bg-[#323235] border border-[#2a2a2c] hover:border-[#3a3a3c] py-3 px-2 rounded text-white text-[11px] font-semibold flex items-center gap-1.5 justify-center transition-all active:scale-95 cursor-pointer"
                  >
                    <span className="inline-block px-1 bg-red-650/30 border border-red-500 text-[8px] scale-95 font-bold uppercase rounded">Ribbon</span>
                    <span>রিবন স্ট্রাইপ</span>
                  </button>
                </div>
              </div>

              {/* Multimedia Image Placement */}
              <div className="space-y-2 pt-1">
                <span className="text-[10px] text-[#666] font-bold uppercase tracking-wider block">৩. মাল্টিমিডিয়া ফ্রেম</span>
                <button
                  onClick={() => onAddElement('image')}
                  className="w-full bg-[#2a2a2c] hover:bg-[#323235] border border-[#2a2a2c] hover:border-[#3a3a3c] py-3 px-3 rounded text-white text-xs font-semibold flex items-center gap-2 justify-center transition-all active:scale-95 cursor-pointer"
                >
                  <Image size={14} className="text-purple-400" />
                  <span>নতুন সংবাদ চিত্র ফ্রেম (Image Window)</span>
                </button>
              </div>
            </div>
            
            {/* Quick tips */}
            <div className="mt-4 p-3 bg-[#2a2a2c]/60 rounded border border-[#2a2a2c] flex items-start gap-2.5">
              <HelpCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-[#888] leading-normal">
                মাউস দিয়ে ক্যানভাসে এলিমেন্ট সরান ও সাইডবার থেকে ডানে প্রোপার্টি এডিট করুন।
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: COLORS, THEME, BACKGROUND */}
        {activeTab === 'theme' && (
          <div className="space-y-5">
            {/* News Outlet color template triggers */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#e1e1e1] uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={11} className="text-red-500" />
                <span>ওয়ান-ক্লিক কালার থিমস</span>
              </h4>
              <p className="text-[10px] text-[#666] leading-normal">সম্পূর্ণ পোস্টার বা কার্টিকে দ্রুত রঙের থিমের সাথে মেলান:</p>
              
              <div className="grid grid-cols-2 gap-2 mt-2">
                {PRESET_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => onApplyTheme(theme)}
                    className="bg-[#2a2a2c] hover:bg-[#323235] border border-[#2a2a2c] hover:border-[#3a3a3c] rounded p-2.5 text-left text-xs font-semibold hover:text-white transition-all active:scale-95 cursor-pointer"
                  >
                    <div className="flex gap-1.5 mb-2">
                      <span className="w-3.5 h-3.5 rounded-full border border-[#202022]" style={{ backgroundColor: theme.primary }} title="প্রাইমারি রং" />
                      <span className="w-3.5 h-3.5 rounded-full border border-[#202022]" style={{ backgroundColor: theme.canvasBg }} title="ক্যানভাস ব্যাকগ্রাউন্ড" />
                      <span className="w-3.5 h-3.5 rounded-full border border-[#202022]" style={{ backgroundColor: theme.darkAccent }} title="ডার্ক এক্সেন্ট" />
                    </div>
                    <span className="text-[11px] text-[#e1e1e1] font-semibold truncate block">{theme.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Background Settings */}
            <div className="pt-2 border-t border-[#2a2a2c] space-y-3">
              <span className="text-[10px] text-[#666] font-bold uppercase tracking-wider block">ক্যানভাস ব্যাকগ্রাউন্ড ধরণ</span>
              
              <div className="flex bg-[#2a2a2c] p-0.5 rounded border border-[#2a2a2c]">
                <button
                  type="button"
                  onClick={() => onChangeBg(customSolidBg, 'solid')}
                  className={`flex-1 py-1 px-2 text-xs font-semibold rounded transition-all cursor-pointer ${
                    canvasBgType === 'solid' ? 'bg-[#3a3a3c] text-white shadow-sm' : 'text-[#888]'
                  }`}
                >
                  ایکک কালার (Solid)
                </button>
                <button
                  type="button"
                  onClick={() => onChangeBg(GRADIENT_PRESETS[0].value, 'gradient', GRADIENT_PRESETS[0].value)}
                  className={`flex-1 py-1 px-2 text-xs font-semibold rounded transition-all cursor-pointer ${
                    canvasBgType === 'gradient' ? 'bg-[#3a3a3c] text-white shadow-sm' : 'text-[#888]'
                  }`}
                >
                  গ্র্যাডিয়েন্ট (Gradient)
                </button>
              </div>

              {canvasBgType === 'solid' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] text-[#888] font-semibold">কাস্টম সলিড কালার:</label>
                    <span className="text-[10px] font-mono select-all text-[#666] lowercase bg-[#0f0f10] px-1.5 py-0.5 rounded border border-[#2a2a2c]">{customSolidBg}</span>
                  </div>
                  <div className="flex gap-2.5 items-center">
                    <input
                      type="color"
                      value={customSolidBg}
                      onChange={(e) => handleSolidBgChange(e.target.value)}
                      className="w-10 h-10 rounded border border-[#2a2a2c] bg-transparent cursor-pointer overflow-hidden p-0"
                    />
                    <div className="grid grid-cols-6 gap-1 w-full">
                      {['#FFFFFF', '#F8FAFC', '#F1F5F9', '#1E293B', '#0F172A', '#020617', '#FEF2F2', '#EFF6FF', '#ECFDF5', '#FFFBEB', '#FFF1F2', '#FCFDF5'].map((color) => (
                        <button
                          key={color}
                          onClick={() => handleSolidBgChange(color)}
                          className={`w-6 h-6 rounded border cursor-pointer ${
                            customSolidBg.toLowerCase() === color.toLowerCase() ? 'border-red-500 scale-110' : 'border-[#2a2a2c] hover:border-[#3a3a3c]'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <span className="text-[10px] text-[#666] font-semibold">গ্র্যাডিয়েন্ট মিক্সার নির্বাচন করুন:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {GRADIENT_PRESETS.map((grad, i) => (
                      <button
                        key={i}
                        onClick={() => onChangeBg(grad.value, 'gradient', grad.value)}
                        className={`p-2.5 rounded text-left text-[10px] font-semibold border relative hover:text-white transition-all overflow-hidden cursor-pointer ${
                          canvasGradient === grad.value ? 'border-red-500 text-red-300' : 'border-[#2a2a2c]'
                        }`}
                        style={{ background: grad.value }}
                      >
                        <div className="absolute inset-0 bg-black/30 hover:bg-black/10 transition-colors" />
                        <span className="relative z-10 text-white font-medium mix-blend-difference">{grad.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Structured texture overlay background choices */}
            <div className="pt-2 border-t border-[#2a2a2c] space-y-2">
              <span className="text-[10px] text-[#666] font-bold uppercase tracking-wider block">ব্যাকগ্রাউন্ড টেক্সচার ওভারলে</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'none', name: 'পরিষ্কার (None)' },
                  { id: 'grid', name: 'গ্রিড মেস (Grid)' },
                  { id: 'dots', name: 'বিন্দু ডটস (Dots)' },
                  { id: 'noise', name: 'নয়েজ (Noise)' },
                ].map((text) => (
                  <button
                    key={text.id}
                    onClick={() => onChangeTexture(text.id)}
                    className={`py-2 px-3 rounded text-xs font-semibold border text-center transition-all cursor-pointer ${
                      canvasTexture === text.id 
                        ? 'bg-red-500/10 border-red-500 text-red-400' 
                        : 'bg-[#2a2a2c] border-[#2a2a2c] text-[#888] hover:text-[#e1e1e1]'
                    }`}
                  >
                    {text.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: LAYERS LIST MANAGER */}
        {activeTab === 'layers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-[#2a2a2c]">
              <div>
                <h3 className="text-xs font-bold text-[#e1e1e1] uppercase tracking-wider">লেয়ার ম্যানেজার</h3>
                <p className="text-[10px] text-[#666]">ডিজাইনের ক্যানভাস ক্রমানুসার (Z-Index)</p>
              </div>
              <span className="bg-[#2a2a2c] border border-[#3a3a3c] text-[10px] font-semibold px-2 py-0.5 rounded text-red-500">{elements.length} টি লেয়ার</span>
            </div>

            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {elements.length === 0 ? (
                <div className="p-4 bg-[#2a2a2c]/30 rounded border border-[#2a2a2c] text-center text-xs text-[#666]">
                  কোনো উপাদান বা লেয়ার নেই
                </div>
              ) : (
                [...elements].reverse().map((elem, idx) => {
                  const isSelected = selectedElementId === elem.id;
                  const innerIdx = elements.findIndex(e => e.id === elem.id);
                  const isLast = innerIdx === elements.length - 1;
                  const isFirst = innerIdx === 0;

                  return (
                    <div
                       key={elem.id}
                       onClick={() => onSelectElement(elem.id)}
                       className={`group/layer flex items-center justify-between p-2.5 rounded border text-xs font-semibold cursor-pointer select-none transition-all ${
                         isSelected 
                           ? 'bg-red-500/10 border-red-500 text-white shadow-sm' 
                           : 'bg-[#2a2a2c] border-[#2a2a2c] hover:border-[#3a3a3c] hover:bg-[#323235] text-[#888] hover:text-white'
                       }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-[9px] font-mono text-[#666] w-4 select-none">#{elements.length - idx}</span>
                        {elem.type === 'text' && <Type size={12} className="text-blue-400" />}
                        {elem.type === 'badge' && <Sparkles size={12} className="text-amber-400" />}
                        {elem.type === 'image' && <Image size={12} className="text-purple-400" />}
                        {elem.type === 'shape' && <Square size={12} className="text-emerald-400" />}
                        {elem.type === 'logo-header' && <Type size={12} className="text-red-400" />}
                        {elem.type === 'footer' && <Type size={12} className="text-slate-400" />}
                        
                        <span className="truncate pr-1 font-medium">{elem.name}</span>
                      </div>

                      {/* Controls layer hierarchy buttons & visible switches */}
                      <div className="flex items-center gap-1 opacity-95 group-hover/layer:opacity-100 shrink-0 select-none">
                        {/* Layer Index Arrows */}
                        <div className="flex mr-1 scale-90">
                          <button
                            onClick={(e) => { e.stopPropagation(); onMoveLayer(elem.id, 'up'); }}
                            disabled={isLast}
                            className={`p-0.5 rounded hover:bg-[#3a3a3c] ${isLast ? 'text-slate-650 opacity-40 hover:bg-transparent' : 'text-[#888] hover:text-white'}`}
                            title="এক ধাপে উপরে আনুন"
                          >
                            <ChevronUp size={14} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); onMoveLayer(elem.id, 'down'); }}
                            disabled={isFirst}
                            className={`p-0.5 rounded hover:bg-[#3a3a3c] ${isFirst ? 'text-slate-650 opacity-40 hover:bg-transparent' : 'text-[#888] hover:text-white'}`}
                            title="এক ধাপে নিচে পাঠান"
                          >
                            <ChevronDown size={14} />
                          </button>
                        </div>

                        {/* Visibility controller */}
                        <button
                          onClick={(e) => { e.stopPropagation(); onToggleVisible(elem.id); }}
                          className={`p-1 rounded hover:bg-[#3a3a3c] ${elem.visible !== false ? 'text-[#888] hover:text-emerald-400' : 'text-red-500 bg-red-500/10'}`}
                          title={elem.visible !== false ? 'লেয়ার লুকান (Hide)' : 'লেয়ার দেখান (Show)'}
                        >
                          {elem.visible !== false ? <Eye size={12} /> : <EyeOff size={12} />}
                        </button>

                        {/* Lock / Freeze element */}
                        <button
                          onClick={(e) => { e.stopPropagation(); onToggleLock(elem.id); }}
                          className={`p-1 rounded hover:bg-[#3a3a3c] ${elem.locked ? 'text-red-500 bg-red-500/10' : 'text-[#888] hover:text-yellow-500'}`}
                          title={elem.locked ? 'লক খুলুন (Unlock)' : 'লক করুন (Lock)'}
                        >
                          {elem.locked ? <Lock size={12} /> : <Unlock size={12} />}
                        </button>

                        {/* Duplicate element */}
                        <button
                          onClick={(e) => { e.stopPropagation(); onDuplicateElement(elem.id); }}
                          className="p-1 rounded hover:bg-[#3a3a3c] text-[#888] hover:text-blue-400"
                          title=" ডুপ্লিকেট লেয়ার"
                        >
                          <Copy size={12} />
                        </button>

                        {/* Remove / Delete element */}
                        <button
                          onClick={(e) => { e.stopPropagation(); onDeleteElement(elem.id); }}
                          className="p-1 rounded hover:bg-red-500/10 text-[#888] hover:text-red-500"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Structured credits footer */}
      <div className="p-3 bg-[#0f0f10] border-t border-[#2a2a2c] flex items-center justify-between text-[10px] text-[#666]">
        <span>Bangla News Kraft v2.4</span>
        <span>2026</span>
      </div>
    </aside>
  );
};

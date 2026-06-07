/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { 
  AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  Bold, Italic, Underline, Lock, Unlock, Copy, 
  Trash2, UploadCloud, Move, Image, Type, Palette, Sparkles, Check
} from 'lucide-react';
import { CanvasElement, ElementStyle, ShapeType } from '../types';
import { BANGLA_FONTS, PRESET_MOCK_IMAGES } from '../data';
import { fileToBase64 } from '../utils';

interface EditorPanelProps {
  selectedElement: CanvasElement | null;
  onUpdateElementStyle: (id: string, style: ElementStyle) => void;
  onUpdateElementContent: (id: string, content: string) => void;
  onUpdateElementImageConfig: (id: string, config: { scale?: number; offsetX?: number; offsetY?: number }) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  onToggleLock: (id: string) => void;
  onUpdateElementPosition: (id: string, x: number, y: number) => void;
  onUpdateElementSize: (id: string, width: number, height: number) => void;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({
  selectedElement,
  onUpdateElementStyle,
  onUpdateElementContent,
  onUpdateElementImageConfig,
  onDeleteElement,
  onDuplicateElement,
  onToggleLock,
  onUpdateElementPosition,
  onUpdateElementSize,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  if (!selectedElement) {
    return (
      <div className="w-80 bg-[#161618] border-l border-[#2a2a2c] flex flex-col h-full items-center justify-center p-6 text-center text-[#888] select-none shrink-0">
        <Sparkles size={32} className="text-red-600 mb-4 animate-pulse" />
        <h3 className="font-bold text-[#e1e1e1] text-xs">উপাদান নির্বাচন করুন</h3>
        <p className="text-[11px] text-[#888] mt-2 leading-relaxed max-w-[220px]">
          লগো, শিরোনাম, খবর-চিত্র বা যেকোনো লিখার ওপর মাউস দিয়ে ক্লিক করে পরিবর্তন বা এডিট শুরু করুন!
        </p>
        <div className="mt-5 text-[10px] text-[#666] bg-[#0f0f10] p-3 rounded border border-[#2a2a2c] max-w-[230px] text-left">
          <span className="font-semibold block text-[#888] mb-1">কুইক এডিটর টিপস:</span>
          ● এলিমেন্ট মাউস দিয়ে ইচ্ছেমতো পজিশন করুন。 <br/>
          ● ড্র্যাগ করে এলিমেন্ট রিসাইজ করুন অতি সহজে।
        </div>
      </div>
    );
  }

  const { style, type, id, content, locked } = selectedElement;

  // Handle local parameter modification helpers
  const handleStyleChange = (key: keyof ElementStyle, value: any) => {
    onUpdateElementStyle(id, { [key]: value });
  };

  const handleContentChange = (val: string) => {
    onUpdateElementContent(id, val);
  };

  // Dedicated Binary Image loaders
  const handleImageFileChange = async (file: File) => {
    try {
      const base64Str = await fileToBase64(file);
      onUpdateElementContent(id, base64Str);
    } catch (err) {
      alert('ইমেজ লোড করতে সমস্যা হয়েছে! অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const onDragLeave = () => {
    setDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFileChange(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-80 bg-[#161618] border-l border-[#2a2a2c] flex flex-col h-full text-[#e1e1e1] select-none shrink-0">
      {/* Element Header */}
      <div className="p-4 bg-[#0f0f10] border-b border-[#2a2a2c] flex items-center justify-between">
        <div className="flex items-center gap-2">
          {type === 'text' && <Type size={14} className="text-blue-500" />}
          {type === 'badge' && <Sparkles size={14} className="text-amber-500 animate-pulse" />}
          {type === 'image' && <Image size={14} className="text-purple-400" />}
          {type === 'shape' && <Palette size={14} className="text-emerald-400" />}
          <span className="font-bold text-xs text-[#e1e1e1] uppercase truncate max-w-[130px]">{selectedElement.name}</span>
        </div>
        
        {/* Quick Duplicate/Delete buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggleLock(id)}
            className={`p-1.5 rounded transition-colors cursor-pointer ${locked ? 'text-red-500 bg-red-650/10' : 'text-[#888] hover:text-yellow-500 hover:bg-[#2a2a2c]'}`}
            title={locked ? 'আনলক করুন' : 'লক করুন'}
          >
            {locked ? <Lock size={12} /> : <Unlock size={12} />}
          </button>
          <button
            onClick={() => onDuplicateElement(id)}
            className="p-1.5 rounded text-[#888] hover:text-blue-400 hover:bg-[#2a2a2c] transition-colors cursor-pointer"
            title="ডুপ্লিকেট এলিমেন্ট"
          >
            <Copy size={12} />
          </button>
          <button
            onClick={() => onDeleteElement(id)}
            className="p-1.5 rounded text-[#888] hover:text-red-500 hover:bg-[#2a2a2c] transition-colors cursor-pointer"
            title="মুছে ফেলুন"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Main Editing parameters scroll viewport */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {locked && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded text-[10.5px] text-amber-500 leading-normal flex items-start gap-2">
            <Lock size={14} className="shrink-0 mt-0.5" />
            <span>উইনডোর এলিমেন্টটি লক করা আছে। এডিটিং সুবিধা চালু রাখতে প্রথমে উপরের লক বাটনে ক্লিক করে আনলক করুন।</span>
          </div>
        )}

        {/* 1. POSITION & COORD COORDINATORS */}
        <div className="space-y-2">
          <span className="text-[10px] text-[#666] font-bold uppercase tracking-wider block">১. সাইজ ও পজিশন (Virtual Pixels)</span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Position inputs */}
            <div>
              <label className="text-[10px] text-[#888] mb-1 block">X-কোঅর্ডিনেট (ডানে/বামে)</label>
              <input
                type="number"
                disabled={locked}
                value={selectedElement.x}
                onChange={(e) => onUpdateElementPosition(id, parseInt(e.target.value) || 0, selectedElement.y)}
                className="w-full bg-[#0f0f10] border border-[#2a2a2c] rounded px-2 py-1.5 font-mono text-center disabled:opacity-50 text-[#e1e1e1]"
              />
            </div>
            <div>
              <label className="text-[10px] text-[#888] mb-1 block">Y-কোঅর্ডিনেট (উপরে/নিচে)</label>
              <input
                type="number"
                disabled={locked}
                value={selectedElement.y}
                onChange={(e) => onUpdateElementPosition(id, selectedElement.x, parseInt(e.target.value) || 0)}
                className="w-full bg-[#0f0f10] border border-[#2a2a2c] rounded px-2 py-1.5 font-mono text-center disabled:opacity-50 text-[#e1e1e1]"
              />
            </div>
            {/* Size inputs */}
            <div>
              <label className="text-[10px] text-[#888] mb-1 block">প্রস্থ (Width)</label>
              <input
                type="number"
                disabled={locked}
                value={selectedElement.width}
                onChange={(e) => onUpdateElementSize(id, parseInt(e.target.value) || 20, selectedElement.height)}
                className="w-full bg-[#0f0f10] border border-[#2a2a2c] rounded px-2 py-1.5 font-mono text-center disabled:opacity-50 text-[#e1e1e1]"
              />
            </div>
            <div>
              <label className="text-[10px] text-[#888] mb-1 block">উচ্চতা (Height)</label>
              <input
                type="number"
                disabled={locked}
                value={selectedElement.height}
                onChange={(e) => onUpdateElementSize(id, selectedElement.width, parseInt(e.target.value) || 10)}
                className="w-full bg-[#0f0f10] border border-[#2a2a2c] rounded px-2 py-1.5 font-mono text-center disabled:opacity-50 text-[#e1e1e1]"
              />
            </div>
          </div>
        </div>

        {/* 2. TEXT CONTENT & WRITINGS */}
        {(type === 'text' || type === 'badge' || type === 'logo-header' || type === 'footer') && (
          <div className="space-y-2 border-t border-[#2a2a2c] pt-3">
            <span className="text-[10px] text-[#666] font-bold uppercase tracking-wider block">২. তথ্য ও বিবরণ বাংলা টেক্সট</span>
            <label className="text-[10px] text-[#888] leading-normal block">এখানে বাংলা টাইপ করুন:</label>
            <textarea
              disabled={locked}
              rows={type === 'text' ? 4 : 2}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              className="w-full bg-[#0f0f10] border border-[#2a2a2c] hover:border-[#3a3a3c] focus:border-red-600 rounded p-2.5 text-xs text-[#e1e1e1] leading-relaxed disabled:opacity-60 focus:outline-none focus:ring-1 focus:ring-red-650 custom-scrollbar"
              placeholder="সংবাদ তথ্য বাংলাতে লিখুন..."
            />
          </div>
        )}

        {/* 3. MULTIMEDIA UPLOADER AND CROP RESIZING FOR IMAGE */}
        {type === 'image' && (
          <div className="space-y-3.5 border-t border-slate-800/80 pt-3">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">২. সংবাদ চিত্র আপলোড ও পজিশনিং</span>
            
            {/* Upload Area */}
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => !locked && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                dragActive 
                  ? 'border-rose-500 bg-rose-500/5' 
                  : 'border-slate-800 hover:border-slate-700 bg-slate-950/60'
              } ${locked ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <UploadCloud size={28} className="mx-auto text-rose-500" />
              <span className="text-[11px] text-slate-300 font-bold block mt-2">ফাইল আপলোড করুন</span>
              <p className="text-[9px] text-slate-500 mt-1">পিসি থেকে ফটো ড্র্যাগ করুন অথবা ক্লিক করুন</p>
              <input
                ref={fileInputRef}
                type="file"
                disabled={locked}
                accept="image/*"
                onChange={(e) => e.target.files && handleImageFileChange(e.target.files[0])}
                className="hidden"
              />
            </div>

            {/* Scale Image Frame zoom slider */}
            <div>
              <div className="flex justify-between items-center text-[10.5px] text-slate-400 font-medium mb-1.5">
                <span>ছবি জুম উইন্ডো (Zoom Inner):</span>
                <span className="font-mono text-rose-400">{(selectedElement.imageScale || 1.0).toFixed(2)}x</span>
              </div>
              <input
                type="range"
                disabled={locked}
                min="0.5"
                max="3.0"
                step="0.05"
                value={selectedElement.imageScale || 1.0}
                onChange={(e) => onUpdateElementImageConfig(id, { scale: parseFloat(e.target.value) })}
                className="w-full accent-rose-500 bg-slate-950 h-1 rounded"
              />
            </div>

            {/* Position inside Frame (Panning) */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9.5px] text-slate-400 mb-1 block">প্যান X (ডানে/বামে)</label>
                <input
                  type="range"
                  disabled={locked}
                  min="-300"
                  max="300"
                  step="2"
                  value={selectedElement.imageOffsetX || 0}
                  onChange={(e) => onUpdateElementImageConfig(id, { offsetX: parseInt(e.target.value) })}
                  className="w-full accent-rose-500 bg-slate-950 h-1 rounded"
                />
              </div>
              <div>
                <label className="text-[9.5px] text-slate-400 mb-1 block">প্যান Y (উপরে/নিচে)</label>
                <input
                  type="range"
                  disabled={locked}
                  min="-300"
                  max="300"
                  step="2"
                  value={selectedElement.imageOffsetY || 0}
                  onChange={(e) => onUpdateElementImageConfig(id, { offsetY: parseInt(e.target.value) })}
                  className="w-full accent-rose-500 bg-slate-950 h-1 rounded"
                />
              </div>
            </div>

            {/* Quick pre-made mockup libraries */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-500 font-semibold block">বাংলাদেশী মক ইমেজ লাইব্রেরী ১০০% ফ্রী:</span>
              <div className="grid grid-cols-3 gap-1.5">
                {PRESET_MOCK_IMAGES.map((img) => (
                  <button
                    key={img.id}
                    disabled={locked}
                    onClick={() => onUpdateElementContent(id, img.url)}
                    className="group border border-slate-800 hover:border-slate-600 rounded bg-slate-950 overflow-hidden h-9 cursor-pointer relative"
                    title={img.name}
                  >
                    <img src={img.url} alt={img.name} className="w-full h-full object-cover transition-all group-hover:scale-110" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. SHAPE SPECIFIC COLORS SELECTOR */}
        {type === 'shape' && (
          <div className="space-y-3.5 border-t border-[#2a2a2c] pt-3">
            <span className="text-[10px] text-[#666] font-bold uppercase tracking-wider block">২. শেপ ও কালার ডিজাইন</span>
            <div>
              <div className="flex justify-between items-center text-[11px] mb-1">
                <label className="text-[#888]">শেপ ব্যাকগ্রাউন্ড ফিল:</label>
                <span className="font-mono text-[#666] text-[10px]">{style.backgroundColor || '#E11D48'}</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="color"
                  disabled={locked}
                  value={style.backgroundColor || '#E11D48'}
                  onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                  className="w-9 h-9 rounded bg-transparent border border-[#2a2a2c] cursor-pointer p-0 overflow-hidden"
                />
                <div className="grid grid-cols-6 gap-1 w-full bg-[#0f0f10] p-1 rounded">
                  {['#E11D48', '#DC2626', '#059669', '#1E293B', '#F59E0B', '#2563EB', '#A3E635', '#0F172A', '#D97706', '#9333EA', '#14B8A6', '#FFFFFF'].map((color) => (
                    <button
                      key={color}
                      disabled={locked}
                      onClick={() => handleStyleChange('backgroundColor', color)}
                      className="w-5 h-5 rounded border border-[#2a2a2c] cursor-pointer"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. TYPOGRAPHY FINE TUNING (FONTS, SIZES, MULTIPLIES) */}
        {(type === 'text' || type === 'badge' || type === 'logo-header' || type === 'footer') && (
          <div className="space-y-3 border-t border-[#2a2a2c] pt-3">
            <span className="text-[10px] text-[#666] font-bold uppercase tracking-wider block">৩. টাইপোগ্রাফি ফাস্ট টিউনিং</span>
            
            {/* Bangla Fonts Loader */}
            <div>
              <label className="text-[10px] text-[#888] mb-1 block">বাংলা ফন্ট নির্বাচন (Google Fonts):</label>
              <select
                disabled={locked}
                value={style.fontFamily || 'Noto Sans Bengali'}
                onChange={(e) => handleStyleChange('fontFamily', e.target.value)}
                className="w-full bg-[#0f0f10] text-[#e1e1e1] border border-[#2a2a2c] hover:border-[#3a3a3c] p-2 text-xs rounded font-medium focus:outline-none"
              >
                {BANGLA_FONTS.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            {/* Font Weights & Alignments row combo */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-[#888] mb-1 block">ফন্ট থিকনেস (Weight)</label>
                <select
                  disabled={locked}
                  value={style.fontWeight || '400'}
                  onChange={(e) => handleStyleChange('fontWeight', e.target.value)}
                  className="w-full bg-[#0f0f10] border border-[#2a2a2c] p-1.5 text-xs rounded text-[#e1e1e1] focus:outline-none"
                >
                  <option value="300">৩০০ - লাইট</option>
                  <option value="400">৪০০ - রেগুলার</option>
                  <option value="500">৫০০ - মিডিয়াম</option>
                  <option value="600">৬০০ - সেমি বোল্ড</option>
                  <option value="700">৭০০ - বোল্ড</option>
                  <option value="800">৮০০ - এক্সট্রা বোল্ড</option>
                </select>
              </div>

              {/* Text Alignment Picker */}
              <div>
                <label className="text-[10px] text-[#888] mb-1 block">অ্যালাইনমেন্ট:</label>
                <div className="flex bg-[#0f0f10] p-0.5 rounded border border-[#2a2a2c]">
                  {(['left', 'center', 'right', 'justify'] as const).map((align) => (
                    <button
                      key={align}
                      type="button"
                      disabled={locked}
                      onClick={() => handleStyleChange('textAlign', align)}
                      className={`flex-1 py-1 px-1 text-xs rounded transition-all flex items-center justify-center cursor-pointer ${
                        style.textAlign === align ? 'bg-[#3a3a3c] text-white shadow-sm' : 'text-[#666] hover:text-[#e1e1e1]'
                      }`}
                      title={align}
                    >
                      {align === 'left' && <AlignLeft size={13} />}
                      {align === 'center' && <AlignCenter size={13} />}
                      {align === 'right' && <AlignRight size={13} />}
                      {align === 'justify' && <AlignJustify size={13} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Font Size & Line Height Slider */}
            <div className="grid grid-cols-1 gap-2.5">
              <div>
                <div className="flex justify-between items-center text-[10px] text-[#888] mb-1">
                  <span>ফন্ট সাইজ (Font Size):</span>
                  <span className="font-mono text-red-500">{style.fontSize || 16}px</span>
                </div>
                <input
                  type="range"
                  disabled={locked}
                  min="9"
                  max="120"
                  step="1"
                  value={style.fontSize || 16}
                  onChange={(e) => handleStyleChange('fontSize', parseInt(e.target.value))}
                  className="w-full accent-red-650 bg-[#0f0f10] h-1 rounded"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-[10px] text-[#888] mb-1">
                  <span>লাইন স্পেসিং (Line Height):</span>
                  <span className="font-mono text-red-500">{style.lineHeight || 1.3}</span>
                </div>
                <input
                  type="range"
                  disabled={locked}
                  min="0.8"
                  max="2.5"
                  step="0.05"
                  value={style.lineHeight || 1.3}
                  onChange={(e) => handleStyleChange('lineHeight', parseFloat(e.target.value))}
                  className="w-full accent-red-650 bg-[#0f0f10] h-1 rounded"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-[10px] text-[#888] mb-1">
                  <span>অক্ষরের গ্যাপ (Letter Spacing):</span>
                  <span className="font-mono text-red-500">{style.letterSpacing || 0}px</span>
                </div>
                <input
                  type="range"
                  disabled={locked}
                  min="-3"
                  max="10"
                  step="0.5"
                  value={style.letterSpacing || 0}
                  onChange={(e) => handleStyleChange('letterSpacing', parseFloat(e.target.value))}
                  className="w-full accent-red-650 bg-[#0f0f10] h-1 rounded"
                />
              </div>
            </div>

            {/* Style enhancements */}
            <div className="flex justify-between pt-1">
              <span className="text-[10px] text-[#888] self-center">লিখা অলংকরণ:</span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  disabled={locked}
                  onClick={() => handleStyleChange('fontStyle', style.fontStyle === 'italic' ? 'normal' : 'italic')}
                  className={`p-1.5 px-2.5 rounded border transition-all text-xs font-semibold cursor-pointer ${
                    style.fontStyle === 'italic' 
                      ? 'bg-red-650 border-red-500 text-white shadow' 
                      : 'bg-[#0f0f10] border-[#2a2a2c] text-[#888] hover:text-white'
                  }`}
                >
                  <Italic size={12} />
                </button>
                <button
                  type="button"
                  disabled={locked}
                  onClick={() => handleStyleChange('textDecoration', style.textDecoration === 'underline' ? 'none' : 'underline')}
                  className={`p-1.5 px-2.5 rounded border transition-all text-xs font-semibold cursor-pointer ${
                    style.textDecoration === 'underline' 
                      ? 'bg-red-650 border-red-500 text-white shadow' 
                      : 'bg-[#0f0f10] border-[#2a2a2c] text-[#888] hover:text-white'
                  }`}
                >
                  <Underline size={12} />
                </button>
              </div>
            </div>
            
            {/* Color of font */}
            <div className="pt-2">
              <div className="flex justify-between items-center text-[10px] mb-1">
                <label className="text-[#888]">অক্ষরের রং সিলেক্ট করুন:</label>
                <span className="font-mono text-red-500">{style.color || '#000000'}</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="color"
                  disabled={locked}
                  value={style.color || '#000000'}
                  onChange={(e) => handleStyleChange('color', e.target.value)}
                  className="w-8 h-8 rounded bg-transparent border border-[#2a2a2c] cursor-pointer p-0"
                />
                <div className="grid grid-cols-6 gap-1 w-full bg-[#0f0f10] p-1 rounded">
                  {['#E11D48', '#0F172A', '#1E293B', '#FFFFFF', '#64748B', '#F59E0B', '#2563EB', '#059669', '#EF4444', '#10B981', '#3B82F6', '#22C55E'].map((color) => (
                    <button
                      key={color}
                      disabled={locked}
                      onClick={() => handleStyleChange('color', color)}
                      className="w-5.5 h-5.5 rounded border border-[#2a2a2c] cursor-pointer"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Badge Specific paddings & solid background colors editing */}
            {type === 'badge' && (
              <div className="space-y-2.5 border-t border-[#2a2a2c] pt-2.5">
                <span className="text-[10px] text-[#666] font-bold block uppercase mt-1">ব্যাজ ব্যাকগ্রাউন্ড মেকওভার</span>
                <div className="flex gap-2">
                  <input
                    type="color"
                    disabled={locked}
                    value={style.backgroundColor || '#E11D48'}
                    onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                    className="w-7 h-7 rounded bg-transparent border border-[#2a2a2c] p-0 cursor-pointer"
                  />
                  <div className="flex-1">
                    <select
                      disabled={locked}
                      value={style.backgroundColor || '#E11D48'}
                      onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                      className="bg-[#0f0f10] border border-[#2a2a2c] text-xs w-full text-[#e1e1e1] rounded p-1.5 focus:outline-none"
                    >
                      <option value="#E11D48">ব্রেকিং লাল</option>
                      <option value="#2563EB">আভিজাত্য নীল</option>
                      <option value="#059669">ক্রীড়া সবুজ</option>
                      <option value="#F59E0B">অ্যাম্বার সোনালী</option>
                      <option value="#1E293B">ডার্ক স্লেট</option>
                      <option value="#64748B">মিষ্টি খয়েরি</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 6. COMPONENT CONTAINER STYLINGS (BORDER RADII, THICKNESS, SHADOW SWELLINGS) */}
        <div className="space-y-3 border-t border-[#2a2a2c] pt-3">
          <span className="text-[10px] text-[#666] font-bold uppercase tracking-wider block">৪. বর্ডার ও ব্যাকগ্রাউন্ড মেকওভার</span>
          
          {/* Border Radious slider */}
          <div>
            <div className="flex justify-between items-center text-[10px] text-[#888] mb-1">
              <span>কর্নার রাউন্ডনেস (Radius):</span>
              <span className="font-mono text-red-500">{style.borderRadius || 0}px</span>
            </div>
            <input
              type="range"
              disabled={locked}
              min="0"
              max="50"
              step="1"
              value={style.borderRadius || 0}
              onChange={(e) => handleStyleChange('borderRadius', parseInt(e.target.value))}
              className="w-full accent-red-650 bg-[#0f0f10] h-1 rounded text-slate-350"
            />
          </div>

          {/* Border Width & Color */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[10px] text-[#888] mb-1 block">বর্ডার পুরুত্ব (Border):</label>
              <input
                type="number"
                disabled={locked}
                min="0"
                max="10"
                value={style.borderWidth || 0}
                onChange={(e) => handleStyleChange('borderWidth', parseInt(e.target.value) || 0)}
                className="w-full bg-[#0f0f10] border border-[#2a2a2c] text-[#e1e1e1] rounded px-2 py-1 font-mono text-center disabled:opacity-50"
              />
            </div>
            <div>
              <label className="text-[10px] text-[#888] mb-1 block">বর্ডার কালার:</label>
              <div className="flex gap-1.5 items-center">
                <input
                  type="color"
                  disabled={locked || !style.borderWidth}
                  value={style.borderColor || '#E11D48'}
                  onChange={(e) => handleStyleChange('borderColor', e.target.value)}
                  className="w-7 h-7 rounded bg-transparent border border-[#2a2a2c] p-0 cursor-pointer overflow-hidden leading-none disabled:opacity-20"
                />
                <span className="text-[9px] font-mono text-[#666] truncate">{style.borderColor || '#E11D48'}</span>
              </div>
            </div>
          </div>

          {/* Opacity level slider change */}
          <div>
            <div className="flex justify-between items-center text-[10px] text-[#888] mb-1">
              <span>উপাদান স্বচ্ছতা (Opacity):</span>
              <span className="font-mono text-red-500">{style.opacity !== undefined ? style.opacity : 100}%</span>
            </div>
            <input
              type="range"
              disabled={locked}
              min="10"
              max="100"
              step="5"
              value={style.opacity !== undefined ? style.opacity : 100}
              onChange={(e) => handleStyleChange('opacity', parseInt(e.target.value))}
              className="w-full accent-red-650 bg-[#0f0f10] h-1 rounded text-slate-350"
            />
          </div>

          {/* Box Shadow styling configs */}
          <div>
            <span className="text-[10px] text-[#888] font-semibold block mb-1">অ্যাকসেন্ট শ্যাডো ড্রপ (Shadow Type):</span>
            <select
              disabled={locked}
              value={style.boxShadow || 'none'}
              onChange={(e) => handleStyleChange('boxShadow', e.target.value)}
              className="bg-[#0f0f10] text-[#e1e1e1] text-xs w-full border border-[#2a2a2c] p-2 rounded focus:outline-none focus:ring-1 focus:ring-red-650"
            >
              <option value="none">কোনো শ্যাডো নেই (Flat)</option>
              <option value="0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)">হালকা লাইট শ্যাডো</option>
              <option value="0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)">মিডিয়াম ড্রপ শ্যাডো</option>
              <option value="0 20px 25px -5px rgba(0,0,0,0.25), 0 10px 10px -5px rgba(0,0,0,0.04)">ইনটেনসিভ বোল্ড শ্যাডো</option>
              <option value="0 10px 15px -3px rgba(225, 29, 72, 0.25)">রেড ব্রেকিং নিয়ন গ্লো</option>
              <option value="0 10px 15px -3px rgba(5, 150, 105, 0.25)">ক্রিকেট গ্রীন নিয়ন গ্লো</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Footer selector panel info */}
      <div className="bg-[#0f0f10] p-3 px-3.5 border-t border-[#2a2a2c] flex items-center text-[10.5px] text-[#888] gap-2 font-medium">
        <Move size={14} className="text-red-500 animate-pulse shrink-0" />
        <span>আপনি কি জানেন? এলিমেন্ট পজিশনিং সরাসরি মাউস দিয়ে টেনেও সমাধান করা যায়!</span>
      </div>
    </div>
  );
};

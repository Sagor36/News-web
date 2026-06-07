/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { NewsCanvas } from './components/NewsCanvas';
import { EditorPanel } from './components/EditorPanel';
import { INITIAL_TEMPLATES, PRESET_THEMES, BANGLA_FONTS } from './data';
import { CanvasElement, CanvasRatio, PresetTheme, ElementStyle, ShapeType } from './types';
import { generateId, exportAsImage } from './utils';
import { Sparkles, HelpCircle, Layers, Check, RefreshCw } from 'lucide-react';

export default function App() {
  const defaultTemplate = INITIAL_TEMPLATES[0];

  // Primary State Containers
  const [elements, setElements] = useState<CanvasElement[]>(
    JSON.parse(JSON.stringify(defaultTemplate.elements))
  );
  const [ratio, setRatio] = useState<CanvasRatio>(defaultTemplate.ratio);
  const [canvasBg, setCanvasBg] = useState<string>(defaultTemplate.canvasBg);
  const [canvasBgType, setCanvasBgType] = useState<'solid' | 'gradient'>(defaultTemplate.canvasBgType);
  const [canvasGradient, setCanvasGradient] = useState<string>(
    defaultTemplate.canvasGradient || 'linear-gradient(135deg, #EF4444 0%, #7F1D1D 100%)'
  );
  const [canvasTexture, setCanvasTexture] = useState<string>(defaultTemplate.canvasTexture || 'none');
  const [activeTemplateId, setActiveTemplateId] = useState<string>(defaultTemplate.id);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Undo & Redo History management
  const [pastStates, setPastStates] = useState<string[]>([]);
  const [futureStates, setFutureStates] = useState<string[]>([]);

  // Push present state into History before applying any change
  const pushHistory = useCallback(() => {
    const stateSnapshot = JSON.stringify({
      elements,
      ratio,
      canvasBg,
      canvasBgType,
      canvasGradient,
      canvasTexture,
      activeTemplateId,
    });
    setPastStates((prev) => [...prev, stateSnapshot]);
    setFutureStates([]); // Redo stack gets flushed
  }, [elements, ratio, canvasBg, canvasBgType, canvasGradient, canvasTexture, activeTemplateId]);

  const handleUndo = useCallback(() => {
    if (pastStates.length === 0) return;
    
    // Core snapshot variables pop & extraction
    const currentSnapshot = JSON.stringify({
      elements,
      ratio,
      canvasBg,
      canvasBgType,
      canvasGradient,
      canvasTexture,
      activeTemplateId,
    });
    setFutureStates((prev) => [...prev, currentSnapshot]);

    const previousSnapshotStr = pastStates[pastStates.length - 1];
    setPastStates((prev) => prev.slice(0, prev.length - 1));

    const restored = JSON.parse(previousSnapshotStr);
    setElements(restored.elements);
    setRatio(restored.ratio);
    setCanvasBg(restored.canvasBg);
    setCanvasBgType(restored.canvasBgType || 'solid');
    setCanvasGradient(restored.canvasGradient || '');
    setCanvasTexture(restored.canvasTexture || 'none');
    setActiveTemplateId(restored.activeTemplateId);
    setSelectedElementId(null);

    triggerToast('পূর্বাবস্থায় ফিরে যাওয়া হয়েছে!');
  }, [pastStates, elements, ratio, canvasBg, canvasBgType, canvasGradient, canvasTexture, activeTemplateId]);

  const handleRedo = useCallback(() => {
    if (futureStates.length === 0) return;

    const currentSnapshot = JSON.stringify({
      elements,
      ratio,
      canvasBg,
      canvasBgType,
      canvasGradient,
      canvasTexture,
      activeTemplateId,
    });
    setPastStates((prev) => [...prev, currentSnapshot]);

    const nextSnapshotStr = futureStates[futureStates.length - 1];
    setFutureStates((prev) => prev.slice(0, prev.length - 1));

    const restored = JSON.parse(nextSnapshotStr);
    setElements(restored.elements);
    setRatio(restored.ratio);
    setCanvasBg(restored.canvasBg);
    setCanvasBgType(restored.canvasBgType || 'solid');
    setCanvasGradient(restored.canvasGradient || '');
    setCanvasTexture(restored.canvasTexture || 'none');
    setActiveTemplateId(restored.activeTemplateId);
    setSelectedElementId(null);

    triggerToast('পরবর্তী অবস্থায় পরিবর্তন করা হয়েছে!');
  }, [futureStates, elements, ratio, canvasBg, canvasBgType, canvasGradient, canvasTexture, activeTemplateId]);

  // Handle Toast helper
  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast(null);
    }, 3000);
  };

  // Keyboard binding for Undo / Redo / Delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo binding
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      }
      // Redo binding
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
      // Delete binding
      if (e.key === 'Delete' && selectedElementId) {
        // Enforce not deleting when typing in input
        const activeNode = document.activeElement;
        if (activeNode?.tagName !== 'INPUT' && activeNode?.tagName !== 'TEXTAREA') {
          e.preventDefault();
          handleDeleteElement(selectedElementId);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, selectedElementId]);

  // Load a whole preset news template on user trigger
  const handleSelectTemplate = (templateId: string) => {
    const selected = INITIAL_TEMPLATES.find((t) => t.id === templateId);
    if (!selected) return;

    pushHistory();
    setElements(JSON.parse(JSON.stringify(selected.elements)));
    setRatio(selected.ratio);
    setCanvasBg(selected.canvasBg);
    setCanvasBgType(selected.canvasBgType);
    setCanvasGradient(selected.canvasGradient || '');
    setCanvasTexture(selected.canvasTexture || 'none');
    setActiveTemplateId(selected.id);
    setSelectedElementId(null);
    
    triggerToast(`"${selected.bengaliName}" লেআউট লোড করা হয়েছে!`);
  };

  // Update canvas background color or gradient
  const handleChangeBg = (newBg: string, type: 'solid' | 'gradient', gradient?: string) => {
    pushHistory();
    setCanvasBgType(type);
    if (type === 'solid') {
      setCanvasBg(newBg);
    } else if (gradient) {
      setCanvasGradient(gradient);
    }
  };

  // Replace canvas background texture
  const handleChangeTexture = (texture: string) => {
    pushHistory();
    setCanvasTexture(texture);
  };

  // Add highly intuitive new elements centered on the viewport
  const handleAddElement = (type: 'text' | 'image' | 'badge' | 'shape', shapeType?: ShapeType) => {
    pushHistory();
    const id = generateId();
    
    // Default virtual height factor depending on aspect ratio to place item in visible center
    const isPortrait = ratio === '4:5' || ratio === '9:16';
    const centerY = isPortrait ? 380 : 260;

    let newElem: CanvasElement;

    if (type === 'text') {
      newElem = {
        id,
        type: 'text',
        name: 'নতুন বাংলা লিখা',
        x: 200,
        y: centerY,
        width: 400,
        height: 60,
        content: 'আপনার সংবাদ বিবরণটি এখানে লিখুন',
        style: {
          color: canvasBg === '#FFFFFF' || canvasBg === '#FAFAFA' ? '#1E293B' : '#FFFFFF',
          fontSize: 20,
          fontWeight: '500',
          fontFamily: 'Hind Siliguri',
          textAlign: 'center',
        },
      };
    } else if (type === 'badge') {
      newElem = {
        id,
        type: 'badge',
        name: 'নতুন স্ট্যাটাস ব্যাজ',
        x: 320,
        y: centerY,
        width: 160,
        height: 38,
        content: 'বিশেষ সংবাদ',
        style: {
          color: '#FFFFFF',
          backgroundColor: '#E11D48',
          fontSize: 14,
          fontWeight: '700',
          fontFamily: 'Hind Siliguri',
          textAlign: 'center',
          borderRadius: 6,
          paddingY: 5,
        },
      };
    } else if (type === 'image') {
      newElem = {
        id,
        type: 'image',
        name: 'নতুন সংবাদ চিত্র',
        x: 100,
        y: centerY - 100,
        width: 600,
        height: 320,
        content: 'https://images.unsplash.com/photo-1598075702565-d5521683b52f?w=800',
        style: {
          borderRadius: 8,
          borderWidth: 2,
          borderColor: '#E11D48',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
        },
        imageScale: 1.0,
        imageOffsetX: 0,
        imageOffsetY: 0,
      };
    } else {
      // Shape adder
      newElem = {
        id,
        type: 'shape',
        name: shapeType === 'rectangle' ? 'লাল আয়তাকার শেপ' : shapeType === 'circle' ? 'সার্কেল শেপ' : 'লাইন শেপ',
        x: 250,
        y: centerY,
        width: shapeType === 'line' ? 300 : 200,
        height: shapeType === 'line' ? 3 : 120,
        content: shapeType || 'rectangle',
        style: {
          backgroundColor: '#E11D48',
        },
        shapeType: shapeType || 'rectangle',
      };
    }

    setElements((prev) => [...prev, newElem]);
    setSelectedElementId(id); // Instantly focus on the newly added object!
    triggerToast('ক্যানভাসে নতুন উপাদান যোগ করা হয়েছে!');
  };

  // Modify styles coordinates of a selected item in real-time
  const handleUpdateElementStyle = (id: string, updatedStyle: ElementStyle) => {
    setElements((prev) =>
      prev.map((elem) =>
        elem.id === id ? { ...elem, style: { ...elem.style, ...updatedStyle } } : elem
      )
    );
  };

  // Modify text info content of selected items
  const handleUpdateElementContent = (id: string, content: string) => {
    setElements((prev) =>
      prev.map((elem) => (elem.id === id ? { ...elem, content } : elem))
    );
  };

  // Modify inner image scaling zoom or displacement coordinates
  const handleUpdateElementImageConfig = (
    id: string,
    config: { scale?: number; offsetX?: number; offsetY?: number }
  ) => {
    setElements((prev) =>
      prev.map((elem) => {
        if (elem.id !== id) return elem;
        return {
          ...elem,
          imageScale: config.scale !== undefined ? config.scale : elem.imageScale,
          imageOffsetX: config.offsetX !== undefined ? config.offsetX : elem.imageOffsetX,
          imageOffsetY: config.offsetY !== undefined ? config.offsetY : elem.imageOffsetY,
        };
      })
    );
  };

  // Update elements location X & Y
  const handleUpdateElementPosition = (id: string, x: number, y: number) => {
    setElements((prev) =>
      prev.map((elem) => (elem.id === id ? { ...elem, x, y } : elem))
    );
  };

  // Update size X & Y
  const handleUpdateElementSize = (id: string, width: number, height: number) => {
    setElements((prev) =>
      prev.map((elem) => (elem.id === id ? { ...elem, width, height } : elem))
    );
  };

  // Lock elements from mouse selections
  const handleToggleLock = (id: string) => {
    pushHistory();
    setElements((prev) =>
      prev.map((elem) => (elem.id === id ? { ...elem, locked: !elem.locked } : elem))
    );
    triggerToast('লেয়ার লক পরিবর্তন করা হয়েছে!');
  };

  // Hide / show elements
  const handleToggleVisible = (id: string) => {
    pushHistory();
    setElements((prev) =>
      prev.map((elem) => (elem.id === id ? { ...elem, visible: elem.visible === false ? true : false } : elem))
    );
  };

  // Delete element from active map
  const handleDeleteElement = (id: string) => {
    pushHistory();
    setElements((prev) => prev.filter((elem) => elem.id !== id));
    if (selectedElementId === id) setSelectedElementId(null);
    triggerToast('উপাদানটি মুছে ফেলা হয়েছে!');
  };

  // Clone elements instantly with offset spacing
  const handleDuplicateElement = (id: string) => {
    const target = elements.find((e) => e.id === id);
    if (!target) return;

    pushHistory();
    const newId = generateId();
    const duplicated: CanvasElement = {
      ...JSON.parse(JSON.stringify(target)),
      id: newId,
      name: `${target.name} (কপি)`,
      x: target.x + 25, // Shift x coordinate layout slightly
      y: target.y + 25, // Shift y slightly so notice is clear
      locked: false,
    };

    setElements((prev) => [...prev, duplicated]);
    setSelectedElementId(newId);
    triggerToast('উপাদানটি ডুপ্লিকেট করা হয়েছে!');
  };

  // Reorder elements layout indexes
  const handleMoveLayer = (id: string, direction: 'up' | 'down') => {
    const idx = elements.findIndex((e) => e.id === id);
    if (idx === -1) return;

    pushHistory();
    const reordered = [...elements];
    if (direction === 'up' && idx < elements.length - 1) {
      // Swap with next index up
      const rHelp = reordered[idx];
      reordered[idx] = reordered[idx + 1];
      reordered[idx + 1] = rHelp;
    } else if (direction === 'down' && idx > 0) {
      // Swap with prev index down
      const rHelp = reordered[idx];
      reordered[idx] = reordered[idx - 1];
      reordered[idx - 1] = rHelp;
    }
    setElements(reordered);
  };

  // Handle fine aspect ratios
  const handleChangeRatio = (newRatio: CanvasRatio) => {
    pushHistory();
    setRatio(newRatio);
    triggerToast(`ক্যানভাস রেশিও ${newRatio} এ পরিবর্তন করা হয়েছে!`);
  };

  // Entire design hard-revert defaults
  const handleReset = () => {
    pushHistory();
    setElements(JSON.parse(JSON.stringify(defaultTemplate.elements)));
    setRatio(defaultTemplate.ratio);
    setCanvasBg(defaultTemplate.canvasBg);
    setCanvasBgType(defaultTemplate.canvasBgType);
    setCanvasGradient(defaultTemplate.canvasGradient || '');
    setCanvasTexture(defaultTemplate.canvasTexture || 'none');
    setActiveTemplateId(defaultTemplate.id);
    setSelectedElementId(null);
    triggerToast('ডিজাইন রিসেট করা হয়েছে! আগের অবস্থায় ফিরে যেতে "Undo" চাপুন।');
  };

  // Automatic Theme Color Realigner
  const handleApplyTheme = (theme: PresetTheme) => {
    pushHistory();
    setCanvasBg(theme.canvasBg);
    setCanvasBgType('solid');

    const recolored = elements.map((elem) => {
      const updatedStyle = { ...elem.style };
      const isDarkBg = theme.canvasBg === '#1E293B' || theme.canvasBg === '#020617' || theme.canvasBg === '#0F172A' || theme.canvasBg === '#090D1A';

      if (elem.type === 'badge') {
        updatedStyle.backgroundColor = theme.primary;
        updatedStyle.color = '#FFFFFF';
        if (elem.id === 'score-overlay-badge') {
          updatedStyle.backgroundColor = isDarkBg ? '#1E293B' : '#F7FEE7';
          updatedStyle.color = isDarkBg ? '#F59E0B' : '#022C22';
          updatedStyle.borderColor = isDarkBg ? '#F59E0B' : '#A3E635';
        }
      } else if (elem.type === 'logo-header') {
        updatedStyle.color = isDarkBg ? '#FFFFFF' : theme.primary;
      } else if (elem.type === 'footer') {
        updatedStyle.color = isDarkBg ? '#94A3B8' : theme.darkAccent;
      } else if (elem.type === 'shape') {
        if (
          elem.id === 'headline-backing-bar' ||
          elem.id === 'gold-top-bar' ||
          elem.id === 'nat-red-accent' ||
          elem.id === 'sports-top-bar' ||
          elem.id === 'accent-top-bar'
        ) {
          updatedStyle.backgroundColor = theme.primary;
        } else if (elem.id === 'footer-ribbon' || elem.id === 'nat-stripe-top') {
          updatedStyle.backgroundColor = theme.darkAccent;
        } else {
          updatedStyle.backgroundColor = theme.primary;
        }
      } else if (elem.type === 'text') {
        if (
          elem.id === 'main-headline' ||
          elem.id === 'quote-headline' ||
          elem.id === 'sports-headline' ||
          elem.id === 'nat-headline'
        ) {
          updatedStyle.color = isDarkBg ? '#FFFFFF' : '#0F172A';
        } else if (
          elem.id === 'sub-headline' ||
          elem.id === 'quote-context' ||
          elem.id === 'sports-subtext' ||
          elem.id === 'nat-paragraph'
        ) {
          updatedStyle.color = isDarkBg ? '#94A3B8' : '#475569';
        } else if (elem.id === 'speaker-name') {
          updatedStyle.color = theme.primary;
        } else if (elem.id === 'date-badge' || elem.id === 'nat-sublabel') {
          updatedStyle.color = isDarkBg ? theme.primary : '#64748B';
        } else if (elem.id.startsWith('quote-decorator')) {
          updatedStyle.color = isDarkBg ? '#1E293B' : '#F1F5F9';
        } else {
          updatedStyle.color = theme.textColor;
        }
      } else if (elem.type === 'image') {
        updatedStyle.borderColor = theme.primary;
      }

      return { ...elem, style: updatedStyle };
    });

    setElements(recolored);
    triggerToast(`"${theme.name}" রঙের থিম প্রয়োগ করা হয়েছে!`);
  };

  // Re-sync all typography block color attributes cleanly based on contrast
  const handleAutoColorMatch = () => {
    pushHistory();
    const isDarkBg = canvasBg === '#1E293B' || canvasBg === '#020617' || canvasBg === '#0F172A' || canvasBg === '#090D1A';
    
    // Automatically pair font properties based on active colors
    const matched = elements.map((elem) => {
      const updatedStyle = { ...elem.style };
      if (elem.type === 'text' || elem.type === 'logo-header' || elem.type === 'footer') {
        if (elem.id?.includes('headline')) {
          updatedStyle.color = isDarkBg ? '#FFFFFF' : '#0F172A';
        } else if (elem.id?.includes('sub-headline') || elem.id?.includes('paragraph') || elem.id?.includes('description')) {
          updatedStyle.color = isDarkBg ? '#94A3B8' : '#475569';
        } else if (elem.id?.includes('date') || elem.id?.includes('time')) {
          updatedStyle.color = isDarkBg ? '#F59E0B' : '#64748B';
        }
      }
      return { ...elem, style: updatedStyle };
    });
    setElements(matched);
    triggerToast('ক্যানভাস টেক্সট কালার বুদ্ধিমানভাবে বিন্যাসিত করা হয়েছে!');
  };

  // Font pairing helpers for 1-click styling
  const handleApplyFontPairing = (titleFont: string, bodyFont: string) => {
    pushHistory();
    const paired = elements.map((elem) => {
      const updatedStyle = { ...elem.style };
      if (elem.type === 'text' || elem.type === 'logo-header' || elem.type === 'footer' || elem.type === 'badge') {
        const isTitle = 
          elem.id?.includes('headline') || 
          elem.id?.includes('logo') || 
          elem.id?.includes('speaker-name');
        
        updatedStyle.fontFamily = isTitle ? titleFont : bodyFont;
      }
      return { ...elem, style: updatedStyle };
    });
    setElements(paired);
    triggerToast('১-ক্লিক আকর্ষণীয় বাংলা ফন্ট ম্যাচিং সফল!');
  };

  // Capture current state, compute sizes, download photo frame
  const handleExportCard = async (format: 'png' | 'jpeg') => {
    try {
      setIsExporting(true);
      setSelectedElementId(null); // Clear selection highlights inside the photo bounds before capture!
      
      // Delay slightly for render cycles to lock state
      await new Promise((resolve) => setTimeout(resolve, 200));

      const virtualHeight = ratio === '1:1' ? 800 : ratio === '4:5' ? 1000 : ratio === '16:9' ? 450 : 1422;
      const exportDimension = { width: 800, height: virtualHeight };

      const timestamp = new Date().toISOString().slice(0, 10);
      const fileName = `bangla_news_${timestamp}_${ratio.replace(':', '_')}`;

      const finishSuccess = await exportAsImage(
        'news-capture-canvas',
        fileName,
        format,
        exportDimension
      );

      if (finishSuccess) {
        triggerToast(`ডিজাইন পোস্টার ${format.toUpperCase()} ফরম্যাটে ডাউনলোড সম্পন্ন হয়েছে!`);
      } else {
        triggerToast('কোড রেন্ডারিংয়ে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
      }
    } catch (e) {
      console.error('Failed capturing layout:', e);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0f0f10] font-sans">
      {/* Dynamic Toast Notifications */}
      {successToast && (
        <div className="fixed top-18 right-6 bg-red-600 border border-red-500 text-white font-semibold text-xs py-2.5 px-4 rounded shadow-lg shadow-black/40 animate-bounce flex items-center gap-2 z-50">
          <Check size={14} className="rounded-full bg-white/20 p-0.5 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Top Controller Ribbon */}
      <Navbar
        appName="Bangla News Kraft"
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={pastStates.length > 0}
        canRedo={futureStates.length > 0}
        onExport={handleExportCard}
        isExporting={isExporting}
        ratio={ratio}
        onChangeRatio={handleChangeRatio}
        onReset={handleReset}
        onAutoMatchTheme={handleAutoColorMatch}
      />

      {/* Main Core workspace layout split and bento wrapper */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Control Column */}
        <Sidebar
          templates={INITIAL_TEMPLATES}
          activeTemplateId={activeTemplateId}
          onSelectTemplate={handleSelectTemplate}
          canvasBg={canvasBg}
          canvasBgType={canvasBgType}
          canvasGradient={canvasGradient}
          canvasTexture={canvasTexture}
          onChangeBg={handleChangeBg}
          onChangeTexture={handleChangeTexture}
          elements={elements}
          selectedElementId={selectedElementId}
          onSelectElement={setSelectedElementId}
          onAddElement={handleAddElement}
          onDeleteElement={handleDeleteElement}
          onDuplicateElement={handleDuplicateElement}
          onToggleLock={handleToggleLock}
          onToggleVisible={handleToggleVisible}
          onMoveLayer={handleMoveLayer}
          onApplyTheme={handleApplyTheme}
        />

        {/* Central Display Area with grid references */}
        <main className="flex-1 flex flex-col min-h-0 bg-[#0f0f10] border-r border-[#2a2a2c] relative">
          {/* Quick Smart Styling overlay banner helper */}
          <div className="bg-[#161618] border-b border-[#2a2a2c] px-5 py-2.5 flex items-center justify-between text-xs text-[#888]">
            <div className="flex items-center gap-2.5">
              <Sparkles size={14} className="text-red-500 shrink-0" />
              <span className="font-semibold block text-[#e1e1e1]">বাংলা ফন্ট পেয়ারিং জোড়:</span>
              <div className="flex items-center gap-1 bg-[#0f0f10] p-0.5 rounded border border-[#2a2a2c] scale-95 origin-left">
                <button
                  onClick={() => handleApplyFontPairing('Noto Sans Bengali', 'Hind Siliguri')}
                  className="px-2 py-1 hover:text-white rounded text-[10px] font-bold hover:bg-[#2a2a2c] transition-colors cursor-pointer"
                  title="Noto Sans + Hind Siliguri"
                >
                  মডার্ন পেয়ার
                </button>
                <div className="w-[1px] h-3 bg-[#2a2a2c]" />
                <button
                  onClick={() => handleApplyFontPairing('Noto Serif Bengali', 'Noto Serif Bengali')}
                  className="px-2 py-1 hover:text-white rounded text-[10px] font-bold hover:bg-[#2a2a2c] transition-colors cursor-pointer"
                  title="Traditional Print classic look"
                >
                  পত্রিকা ক্লাসিক
                </button>
                <div className="w-[1px] h-3 bg-[#2a2a2c]" />
                <button
                  onClick={() => handleApplyFontPairing('Galada', 'Hind Siliguri')}
                  className="px-2 py-1 hover:text-white rounded text-[10px] font-bold hover:bg-[#2a2a2c] transition-colors cursor-pointer"
                  title="Calligraphy Headline + Hind Siliguri body"
                >
                  ক্যালিগ্রাফি রূপকার
                </button>
                <div className="w-[1px] h-3 bg-[#2a2a2c]" />
                <button
                  onClick={() => handleApplyFontPairing('Mina', 'Hind Siliguri')}
                  className="px-2 py-1 hover:text-white rounded text-[10px] font-bold hover:bg-[#2a2a2c] transition-colors cursor-pointer"
                  title="Rounded layout style"
                >
                  স্টাইলিশ গোলগাল
                </button>
              </div>
            </div>
            
            <div className="hidden lg:flex items-center gap-2 font-medium">
              <HelpCircle size={13} className="text-[#666]" />
              <span>সহজ এডিটিং গাইড: ক্যানভাসের ওপর ডাবল ক্লিক করে লিখা সিলেক্ট করা সম্ভব! </span>
            </div>
          </div>

          {/* Interactive Canvas Rendering Port */}
          <div className="flex-1 relative min-h-0 flex items-center justify-center. p-1 select-none animate-canvas-entrance">
            <NewsCanvas
              elements={elements}
              selectedElementId={selectedElementId}
              onSelectElement={setSelectedElementId}
              onUpdateElementPosition={handleUpdateElementPosition}
              onUpdateElementSize={handleUpdateElementSize}
              onCommitHistory={pushHistory}
              ratio={ratio}
              canvasBg={canvasBg}
              canvasBgType={canvasBgType}
              canvasGradient={canvasGradient}
              canvasTexture={canvasTexture}
            />
          </div>
        </main>

        {/* Right Sided Parameters Fine Tuner panel */}
        <EditorPanel
          selectedElement={elements.find((el) => el.id === selectedElementId) || null}
          onUpdateElementStyle={handleUpdateElementStyle}
          onUpdateElementContent={handleUpdateElementContent}
          onUpdateElementImageConfig={handleUpdateElementImageConfig}
          onDeleteElement={handleDeleteElement}
          onDuplicateElement={handleDuplicateElement}
          onToggleLock={handleToggleLock}
          onUpdateElementPosition={handleUpdateElementPosition}
          onUpdateElementSize={handleUpdateElementSize}
        />
      </div>
    </div>
  );
}

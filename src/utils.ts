/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { toPng, toJpeg } from 'html-to-image';
import { CanvasElement } from './types';

// Convert number to Bengali digits
export const toBengaliDigits = (num: number | string): string => {
  const bengaliNumbers = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().replace(/\d/g, (x) => bengaliNumbers[parseInt(x, 10)]);
};

// Generate UUID for elements
export const generateId = (): string => {
  return 'elem_' + Math.random().toString(36).substr(2, 9);
};

// Undo-Redo Stack helper
export class HistoryTracker<T> {
  private past: T[] = [];
  private present: T;
  private future: T[] = [];
  private maxDepth: number;

  constructor(initialState: T, maxDepth = 40) {
    this.present = JSON.parse(JSON.stringify(initialState));
    this.maxDepth = maxDepth;
  }

  get state(): T {
    return this.present;
  }

  push(newState: T) {
    // Stringify and parse to deep clone state and avoid reference leaks
    const cloned = JSON.parse(JSON.stringify(newState));
    
    // Prevent duplicated states in history if they match
    if (JSON.stringify(this.present) === JSON.stringify(cloned)) {
      return;
    }

    this.past.push(this.present);
    this.present = cloned;
    this.future = []; // Clear redo stack on new action
    
    if (this.past.length > this.maxDepth) {
      this.past.shift();
    }
  }

  undo(): T | null {
    if (this.past.length === 0) return null;
    
    const previous = this.past.pop()!;
    this.future.push(this.present);
    this.present = previous;
    return this.present;
  }

  redo(): T | null {
    if (this.future.length === 0) return null;
    
    const next = this.future.pop()!;
    this.past.push(this.present);
    this.present = next;
    return this.present;
  }

  canUndo(): boolean {
    return this.past.length > 0;
  }

  canRedo(): boolean {
    return this.future.length > 0;
  }
}

// Convert uploaded file to base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// Export element container as image (PNG or JPG)
export const exportAsImage = async (
  domId: string,
  fileName: string,
  format: 'png' | 'jpeg',
  exportDimension: { width: number; height: number }
): Promise<boolean> => {
  const node = document.getElementById(domId);
  if (!node) {
    console.error('Target DOM node not found for export:', domId);
    return false;
  }

  try {
    // Prepare scaling style options for high resolution export (2x scale for crisp lines and text)
    const originalStyle = node.style.transform;
    
    // Temporarily reset transform scale of the DOM before running html-to-image
    const options = {
      width: exportDimension.width,
      height: exportDimension.height,
      style: {
        transform: 'scale(1)',
        transformOrigin: 'top left',
      },
      quality: 0.98,
      backgroundColor: '#ffffff',
      cacheBust: true,
    };

    let dataUrl = '';
    if (format === 'png') {
      dataUrl = await toPng(node, options);
    } else {
      dataUrl = await toJpeg(node, options);
    }

    // Trigger download
    const link = document.createElement('a');
    link.download = `${fileName}.${format}`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (error) {
    console.error('Failed to export image:', error);
    return false;
  }
};

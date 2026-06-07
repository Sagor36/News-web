/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CanvasRatio = '1:1' | '4:5' | '16:9' | '9:16';

export type ElementType = 'text' | 'image' | 'badge' | 'logo-header' | 'footer' | 'shape' | 'custom';

export type ShapeType = 'rectangle' | 'circle' | 'line' | 'ribbon' | 'quote-bracket';

export interface ElementStyle {
  color?: string;
  backgroundColor?: string;
  fontSize?: number; // in virtual pixels
  lineHeight?: number; // multiplayer of font size (e.g. 1.2)
  letterSpacing?: number; // in px
  fontWeight?: string; // '300' | '400' | '500' | '600' | '700' | '800'
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  paddingX?: number;
  paddingY?: number;
  opacity?: number; // 0 to 100
  boxShadow?: string;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  fontStyle?: 'italic' | 'normal';
  textDecoration?: 'none' | 'underline';
}

export interface CanvasElement {
  id: string;
  type: ElementType;
  name: string; // Layer representation name, e.g. "শতকরা ব্যানার"
  x: number; // coordinate relative to virtual Canvas Width
  y: number; // coordinate relative to virtual Canvas Height
  width: number;
  height: number;
  content: string; // Title / Description text, image URL, or shape properties
  style: ElementStyle;
  
  // Specific settings
  imageScale?: number; // For image zoom (e.g. 1 to 3)
  imageOffsetX?: number; // For panning image inside frame
  imageOffsetY?: number;
  shapeType?: ShapeType;
  locked?: boolean;
  visible?: boolean;
}

export interface PresetTheme {
  id: string;
  name: string;
  primary: string; // Red accent typically
  secondary: string; // White/light tint
  darkAccent: string; // Dark charcoal / Black
  lightAccent: string; // Off-white
  textColor: string;
  canvasBg: string;
}

export interface PresetTemplate {
  id: string;
  name: string;
  bengaliName: string;
  description: string;
  ratio: CanvasRatio;
  themeId: string;
  canvasBg: string;
  canvasBgType: 'solid' | 'gradient';
  canvasGradient?: string;
  canvasTexture?: string; // 'none' | 'grid' | 'dots' | 'noise'
  elements: CanvasElement[];
}

# Luxury Restaurant App Design Specifications

This document outlines the design specifications extracted from the luxury restaurant booking client.

## 1. Typography
- **Primary Font (Sans-serif):** `'Outfit', system-ui, sans-serif`
- **Secondary/Display Font (Serif):** `'Playfair Display', serif`

## 2. Color Palette
The design utilizes a dark luxury theme with a rich gold accent scale.

### Background & Surface (Luxury Dark Scale)
- `--color-luxury-950`: `#050505`
- `--color-luxury-900`: `#0a0a0a` (Main Background)
- `--color-luxury-800`: `#141414`
- `--color-luxury-700`: `#1f1f1f`
- `--color-luxury-600`: `#2e2e2e`
- **Text Color:** `#e5e5e5`

### Accents (Gold Scale)
- `--color-gold-50`: `#fbf9f1`
- `--color-gold-100`: `#f5eed8`
- `--color-gold-200`: `#ecdbb0`
- `--color-gold-300`: `#e0c27e`
- `--color-gold-400`: `#d6a754`
- `--color-gold-500`: `#cb8e34`
- `--color-gold-600`: `#b06f28`
- `--color-gold-700`: `#925324`
- `--color-gold-800`: `#784223`
- `--color-gold-900`: `#623620`

## 3. UI Components & Effects

### Glassmorphism
- **`.glass-panel`**: 
  - Background: `rgba(20, 20, 20, 0.65)`
  - Blur: `24px`
  - Border: `1px solid rgba(255, 255, 255, 0.05)`
  - Shadow: `0 8px 32px 0 rgba(0, 0, 0, 0.5)`
- **`.glass-pill`**: 
  - Background: `rgba(10, 10, 10, 0.8)`
  - Blur: `32px`
  - Border: `1px solid rgba(214, 167, 84, 0.15)`
  - Shadow: `0 4px 24px -2px rgba(0, 0, 0, 0.6)`, inset `0 0 0 1px rgba(255,255,255,0.02)`

### Text Effects
- **`.text-gradient-gold`**: Linear gradient text from `#f5eed8` to `#d6a754` to `#b06f28`.

### Input Fields (`.luxury-input`)
- **Base:** `rgba(255, 255, 255, 0.03)` with `1px solid rgba(255, 255, 255, 0.08)` border.
- **Radius:** `12px`
- **Hover:** Border slightly lighter (`rgba(255, 255, 255, 0.15)`), background `rgba(255, 255, 255, 0.04)`.
- **Focus:** Gold glowing border `rgba(214, 167, 84, 0.4)` and box shadow `0 0 20px rgba(214, 167, 84, 0.06)`.

## 4. Animations
- **Float (`.animate-float`):** Smooth vertical translation (8s).
- **Pulse Glow (`.animate-pulse-glow`):** Oscillating opacity and blur filter for ambient glows (6s).
- **Shimmer (`.skeleton`):** Moving linear gradient for loading skeletons.

## 5. Other Enhancements
- **Custom Scrollbar:** Transparent track with `#2e2e2e` thumb (hovers to gold `#d6a754`).
- **Autofill Overrides:** Preserves dark aesthetic by replacing default browser yellow/white autofill with dark background and gold border.

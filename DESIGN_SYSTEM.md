# Cineflex Design System

This document outlines the visual identity, UI tokens, and component guidelines for the Cineflex streaming platform. This system is designed to replicate the premium, immersive experience of Netflix while maintaining high performance and responsiveness.

---

## 1. Design Philosophy
- **Immersive Dark Mode**: The UI uses a deep black palette to minimize eye strain and make content (posters and backdrops) the focus.
- **Content-First Hierarchy**: High-resolution imagery with subtle gradient overlays ensures metadata remains readable without distracting from the artwork.
- **Tactile Transitions**: Every interaction (hover, navigation, toggle) uses smooth, intentional easing (0.2s to 0.4s) to provide a premium "fluid" feel.
- **Netflix Signifiers**: Use of the signature red accent (`#E50914`), bold typography, and cinematic "poster rows" with horizontal scrolling.

---

## 2. Color Palette

### Core Palette
| Token | Hex / RGBA | Usage |
| :--- | :--- | :--- |
| Background Primary | `#141414` | Global body background, main page sections. |
| Background Secondary | `#181818` | Hover popups, card backgrounds, dropdown options. |
| Accent Red | `#E50914` | Primary brand color, selection, buttons, progress indicators. |
| Text Primary | `#FFFFFF` | Main headings, active nav links, white buttons. |
| Text Secondary | `#E5E5E5` | Row titles, secondary labels. |
| Text Muted | `#808080` | Footer text, disclaimer text, year labels. |
| Match Green | `#46D369` | Match percentage indicators in popups. |

### Overlays & Gradients
| Type | Value | Usage |
| :--- | :--- | :--- |
| Hero Left | `linear-gradient(to right, rgba(0,0,0,0.7), transparent)` | Fades backdrop image for text readability. |
| Hero Bottom | `linear-gradient(to top, #141414, transparent)` | Smoothly blends hero into content rows. |
| Top Bar Overlay | `linear-gradient(to bottom, rgba(0,0,0,0.85), transparent)` | Player controls and Navbar shadows. |
| Bottom Bar Overlay | `linear-gradient(to top, rgba(0,0,0,0.85), transparent)` | Episode info in player. |
| Row Edge Fade | `linear-gradient(to right, #141414, transparent)` | Soft edge for media rows. |

---

## 3. Typography
- **Font Family**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;`
- **Antialiasing**: `-webkit-font-smoothing: antialiased;`

### Type Scale
| Size | Weight | Usage |
| :--- | :--- | :--- |
| `text-6xl` | `900 (Black)` | Hero titles (Desktop). |
| `text-4xl` | `900 (Black)` | Hero titles (Mobile), Detail page titles. |
| `text-xl` | `600 (Semibold)` | Media row titles. |
| `text-sm` | `400 (Regular)` | Global body text, descriptions. |
| `text-xs` | `700 (Bold)` | Badges, labels (S1E1), metadata tags. |

- **Text Shadow**: `2px 2px 4px rgba(0,0,0,0.5)` (used on hero/overlay text for readability).

---

## 4. Spacing & Layout
- **Global Padding**: `px-4` (Mobile), `px-12` (Desktop).
- **Section Spacing**: `space-y-8` (Mobile), `space-y-12` (Desktop).
- **Max Width**: `max-w-7xl` for contained sections (Footer), full-width for media rows.
- **Gaps**: `gap-2` to `gap-4` in flex layouts and grids.

---

## 5. Breakpoints
| Prefix | Value | Usage |
| :--- | :--- | :--- |
| `sm` | `640px` | Small mobile devices. |
| `md` | `768px` | Tablets and desktop transition. Navbar switches layout here. |
| `lg` | `1024px` | Standard laptop screens. |
| `xl` | `1280px` | Large monitors. |

---

## 6. Components

### Navbar
- **Height**: Dynamic (approx. 60px).
- **Background**: `transparent` on mount, `#141414` on scroll (`window.scrollY > 50`).
- **Styles**: Sticky top, `z-index: 50`.
- **Search**: Expandable input with `300ms` width transition.

### Media Cards
- **Aspect Ratio**: `16/9` (Landscape).
- **Width**: `clamp(160px, 20vw, 240px)`.
- **Border Radius**: `4px`.
- **Hover Behavior**:
  - `transform: scale(1.05)`
  - `transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)`
  - Displays a Portal-based popup on long hover (`150ms` delay).

### Card Hover Popup
- **Background**: `#181818`.
- **Shadow**: `0 8px 24px rgba(0,0,0,0.8)`.
- **Animation**: `fadeInUp 0.2s ease-out`.

### Buttons
- **Play Button**: `bg-white text-black hover:bg-white/75`.
- **Info Button**: `bg-[#6d6d6e]/70 text-white hover:bg-[#6d6d6e]/40`.
- **Icon Button**: Round, `background: rgba(0,0,0,0.7)`, `border: 1px solid rgba(255,255,255,0.3)`.
- **Surprise Me**: Outlined pill, `border: 1px solid #4b5563`, `hover:border-white`.

---

## 7. Animations & Transitions
- **Standard Transition**: `all 0.2s ease`.
- **Hero Fade**: `0.6s easeOut` (using `framer-motion` / `motion`).
- **Modal Entry**: `0.3s` fade and scale.
- **Scroll Behavior**: `scroll-smooth` for all container scrolling.

---

## 8. Z-index Scale
| Level | Value | Components |
| :--- | :--- | :--- |
| Base | `1` | Normal page flow. |
| Overlays | `10` | Media row edge fades, player bars. |
| Hovered Card | `50` | Active media card scaling. |
| Navigation | `50` | Global Navbar. |
| Popups/Modals | `1000+` | React Portals, Trailer modals. |

---

## 9. Gradients Reference (CSS)
```css
/* Hero Left Shadow */
background: linear-gradient(to right, rgba(0,0,0,0.7), transparent);

/* Hero Bottom Blend */
background: linear-gradient(to top, #141414 0%, rgba(20,20,20,0.5) 20%, transparent 50%);

/* Watch Page Bar Top */
background: linear-gradient(to bottom, rgba(0,0,0,0.9), rgba(0,0,0,0.7));

/* Watch Page Bar Bottom */
background: linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.7));
```

---

## 10. How to Apply This System
1. **Reset Styles**: Use a standard CSS reset or `Tailwind Preflight`.
2. **Define Variables**: Set `--netflix-dark: #141414` and `--netflix-red: #E50914` in `:root`.
3. **Background**: Apply `#141414` to the `body` and `html`.
4. **Layout**: Use `display: flex` and `flex-column` for the main wrapper to ensure Footers stick to the bottom.
5. **Transitions**: Apply `transition-all duration-200 ease` to all interactive elements globally.
6. **Icons**: Use `lucide-react` with standard sizes (`16px`, `20px`, `24px`).

# Tani-Awas Design System (DESIGN.md)

## 1. Visual Theme & Atmosphere
- **Archetype**: Modern Earth Observation & Precision Agro-Intelligence Dashboard (Linear/Dusk precision meets Sentinel Earth Science).
- **Tone**: Authoritative, calm, razor-sharp, zero-distraction. Built for agronomists, field extension officers, and agricultural policy analysts.
- **Surface Philosophy**: Deep obsidian slate (`#090d14` and `#0f141f`), razor 1px hairlines (`#1c2638`), subtle 0.04 alpha inner borders.
- **Accent**: Muted Sage / Agri-Emerald (`#10b981` / `#059669`) with surgical alert states (Crimson `#f43f5e`, Amber `#f59e0b`, Royal Blue `#3b82f6`).

## 2. Color Palette & Roles
- **Canvas / Background**: `#090d14` (Deep obsidian blue-gray)
- **Navbar & Header**: `#0d131f` with 1px border `#1c2638`
- **Surface / Card**: `#111827` (Crisp container background)
- **Surface Highlight**: `#172033` (Hover & active states)
- **Hairline Borders**: `#1c2638` (Structural borders) and `#27354d` (Interactive borders)
- **Typography Primary**: `#f8fafc` (Ultra-high contrast, crisp readability)
- **Typography Secondary**: `#94a3b8` (Subtle supporting text)
- **Typography Muted**: `#64748b` (Metadata, units, auxiliary labels)
- **Accents**:
  - Primary Brand / Satellite NDVI: `#10b981` (Muted emerald)
  - Rainfall / Hydro: `#38bdf8` / `#3b82f6` (Atmospheric blue)
  - Critical Risk: `#f43f5e` (Surgical rose crimson)
  - Warning Risk: `#f59e0b` (Warm amber)
  - Safe Baseline: `#10b981` (Vibrant leaf green)

## 3. Typography Rules & Hierarchy
- **Primary Font**: `Inter`, `-apple-system`, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif.
- **Monospace Font**: `JetBrains Mono`, SFMono-Regular, Consolas, monospace (restricted strictly to telemetry figures, lat/long coords, loss values, and percentages).
- **Type Scale**:
  - Top Bar Title: 1.15rem, font-weight 600, letter-spacing -0.01em
  - Card Headings: 0.85rem, font-weight 600, uppercase, letter-spacing 0.04em
  - Telemetry Big KPI: 1.85rem, font-weight 700, JetBrains Mono, tabular-nums
  - Telemetry Labels: 0.75rem, font-weight 500, color `#94a3b8`
  - Body / Protocol Text: 0.84rem, line-height 1.5, color `#cbd5e1`

## 4. Component Stylings & Atomic Rules
- **Header Navigation**: Fixed clean top bar with project identity, active telemetry status pill, satellite status, and quick district switcher.
- **KPI Metrics Cards**: 4-card metric strip with subtle gradient border, micro-trend tag, and dedicated semantic status icon.
- **Map Viewport**: Embedded Carto Dark Matter / OSM custom styled container with Leaflet custom controls and floating layer toggle.
- **Temporal Chart**: Responsive 2-axis Chart.js with custom glowing gridlines, rounded bar caps, smooth cubic bezier line tension (0.35), and custom tooltip card.
- **Interactive Control Drawer / Panel**: Modern floating glass / structured panel with customized slider thumbs, quick preset buttons, and responsive inputs.
- **Tactical Action Matrix**: Dual-card field protocol grid (Farmers vs Agriculture Service) with timeline badges and priority tags.

## 5. Layout Principles & Grid Systems
- **Header**: Compact 56px sticky top bar.
- **Main Container**: Max-width `1600px`, centered with `24px` fluid padding.
- **Layout Rhythm**:
  - Row 1: Quick Filter Bar & District Selector + Status Overview.
  - Row 2: 4-Column KPI Telemetry Row.
  - Row 3: Geospatial Split Grid (60% Map + Satellite Layers, 40% Multitemporal Trajectory Chart).
  - Row 4: Parameter Fine-Tuning & Field Protocol Directives.
- **Border Radii**: Strict 6px - 8px radius standard (no bloated 24px bubble cards).

## 6. Depth, Elevation & Lighting
- Hairline 1px borders instead of heavy drop-shadows.
- Box shadows are tight and subtle: `0 1px 3px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.24)`.
- No gaudy background gradient circles or glowing neon blur spheres.

## 7. Anti-Slop Negative Constraints
- NO neon cyan/purple cyberpunk tropes.
- NO uppercase rambling jargon.
- NO fake sliders: Every slider, dropdown, and radio button directly recomputes all formulas and graphs in real time.

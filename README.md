# Token Trading Table

A modern, real-time token trading table dashboard built with Next.js, React, and Tailwind CSS. This application provides an enhanced user interface for viewing and analyzing cryptocurrency token data with advanced filtering, sorting, and visualization capabilities.

## Task Overview

This project implements a comprehensive token trading table interface with the following key features:

- **Real-time Data Updates**: Simulated WebSocket connections for live price updates
- **Advanced Filtering**: Dropdown menus and quick filter pills for status-based filtering
- **Enhanced Sorting**: Sortable columns with visual indicators (Market Cap, Price, Volume, Change)
- **Improved Visibility**: Enhanced contrast, larger fonts, better spacing, and clearer visual hierarchy
- **Responsive Design**: Fully responsive layout that works across all device sizes
- **Interactive Components**: Tooltips, popovers, modals, and smooth animations

## Features

### 🎨 Enhanced Design & Layout
- Modern glassmorphic UI with backdrop blur effects
- Improved color contrast and typography for better readability
- Larger font sizes and enhanced spacing throughout
- Gradient backgrounds and animated particles
- Professional card-based layout with enhanced shadows

### 📊 Dropdown Components
- **Status Filter Dropdown**: Filter tokens by status (All, New Pairs, Final Stretch, Migrated)
- **Sort Dropdown**: Sort by Market Cap, Price, Volume (24h), or Change (24h)
- Dropdown menus with icons and smooth animations
- Keyboard accessible and mobile-friendly

### 👁️ Enhanced Visibility
- Increased font sizes for better readability
- Higher contrast text colors (white/gray-200 instead of gray-300/400)
- Enhanced table borders and cell padding
- Larger token avatars and badges
- Improved hover states and transitions
- Better visual feedback for interactive elements

### 🔍 Search & Filtering
- Real-time search by token name or symbol
- Quick filter pills for instant status filtering
- Dropdown menus for advanced filtering options
- Combined search and filter functionality

### 📈 Data Visualization
- Sparkline charts for 7-day price history
- Color-coded price changes (green/red)
- Real-time price flash animations
- Market statistics dashboard
- Detailed token modal with comprehensive information

### ⚡ Performance Optimizations
- React.memo for component memoization
- useMemo and useCallback hooks for optimized rendering
- Efficient state management
- Skeleton loaders for smooth loading experience

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Token-Trading-Table
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
Token-Trading-Table/
├── app/
│   ├── page.tsx          # Main token trading table component
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── public/               # Static assets
├── package.json          # Dependencies
└── README.md            # This file
```

## Key Components

- **TokenTradingTable**: Main component with state management and data flow
- **TokenRow**: Individual token row with all data cells
- **TableHeader**: Sortable table header with visual indicators
- **Dropdown**: Reusable dropdown component for filters and sorting
- **Modal**: Token detail modal with comprehensive information
- **Popover**: Quick info popover for token details
- **Tooltip**: Hover tooltips for additional information
- **Sparkline**: Price history visualization component
- **TokenBadge**: Status badge component with icons

## Technologies Used

- **Next.js 16**: React framework with App Router
- **React 19**: UI library
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS 4**: Utility-first CSS framework
- **Lucide React**: Icon library
- **React Query**: Data fetching and caching (available but not actively used)

## Architecture Highlights

- **Atomic Design**: Components organized by complexity (atoms, molecules, organisms)
- **Performance**: Memoization and optimization throughout
- **Real-time Updates**: WebSocket simulation with smooth transitions
- **Responsive**: Mobile-first design with breakpoints (sm, md, lg, xl)
- **Accessibility**: ARIA labels and keyboard navigation support
- **Loading States**: Skeleton loaders and shimmer effects

## Customization

You can customize the application by:
- Modifying `MOCK_TOKENS` array in `app/page.tsx` to add/remove tokens
- Adjusting colors in Tailwind classes throughout components
- Updating the WebSocket simulation interval (currently 3000ms)
- Adding new filter options or sort criteria

## Build for Production

```bash
npm run build
npm start
```

## Deploy

The easiest way to deploy is using [Vercel](https://vercel.com):

```bash
npm run build
```

Then deploy to Vercel or your preferred hosting platform.

## License

This project is private and proprietary.

# 🏓 PickleScore

A fast, lightweight, and offline-ready doubles pickleball scorekeeper built with React, Vite, and Tailwind CSS. Designed specifically for instant score tracking with dual responsive layouts optimized for both **mobile phones** and **Apple Watch**.

---

## ✨ Features

- **Standard 3-Digit Score Tracking:** Automatically formats and tracks the traditional doubles score format: `Serving Score - Receiving Score - Server #`.
- **Dynamic Team Perspective:** Clear **Us vs. Opponent** setup that automatically flips scores and indicators whenever a side out occurs.
- **Apple Watch & Phone Dual-Layout:** Automatically detects screen constraints and renders an ultra-compact horizontal view with oversized tap targets for watchOS WebKit / Shortcuts, while serving a full vertical interface on iOS/Android phones.
- **Rally History & Undo:** Full state history tracking allows one-tap undo for misclicks or disputed points.
- **Win Detection:** Enforces standard pickleball victory rules (play to 11, win by 2).
- **Zero-Latency Touch:** Configured with `touch-manipulation` to eliminate mobile tap delays.
- **100% Offline / PWA Ready:** Installable to your iPhone Home Screen with zero cell reception required on court.

---

## 🚀 Tech Stack

- **Framework:** [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Offline / PWA:** [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)
- **Deployment:** [Vercel](https://vercel.com/)

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/b-zh/pickleball-scorer.git](https://github.com/b-zh/pickleball-scorer.git)
   cd pickleball-scorer

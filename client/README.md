# Client Application

A modern React application built with Vite, featuring file uploads, color manipulation, payment processing, and a responsive UI.

## Tech Stack

### Core
- **React** 19.2.0 - UI library
- **Vite** 7.3.1 - Build tool and dev server
- **React Router DOM** 7.13.0 - Client-side routing

### Styling
- **Tailwind CSS** 4.1.18 - Utility-first CSS framework
- **Emotion** - CSS-in-JS styling
- **PostCSS** & **Autoprefixer** - CSS processing

### Key Features & Libraries

#### File Management
- **FilePond** - Modern file upload library
    - Image preview support
    - EXIF orientation handling
    - File type validation
    - React integration via `react-filepond`

#### Payment Processing
- **Stripe** - Payment integration
    - `@stripe/stripe-js` - Stripe.js loader
    - `@stripe/react-stripe-js` - React components for Stripe

#### Color Tools
- **Culori** - Comprehensive color manipulation
- **Color Name** - Color name utilities
- **React Color** - Color picker components

#### UI/UX
- **Notistack** - Snackbar notifications
- **React Icons** - Icon library
- **React Scroll** - Smooth scrolling functionality

#### HTTP & Data
- **Axios** - HTTP client for API requests

## Getting Started

### Prerequisites
- Node.js (v16 or higher recommended)
- npm or yarn package manager

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

The application will be available at `http://localhost:5173` (default Vite port).

### Building for Production

```bash
# Create production build
npm run build
```

Build output will be in the `dist` directory.

### Preview Production Build

```bash
# Preview the production build locally
npm run preview
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite development server with HMR |
| `npm run build` | Create optimized production build |
| `npm run preview` | Preview production build locally |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting without making changes |

## Environment Setup

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:8000
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

Access in your code:
```javascript
const apiUrl = import.meta.env.VITE_API_URL;
```

## Code Quality

### Prettier Configuration
The project uses Prettier for code formatting. Run `npm run format` to automatically format all files.

### Testing
Testing setup includes:
- `@testing-library/react` - React component testing
- `@testing-library/jest-dom` - Custom Jest matchers
- `@testing-library/user-event` - User interaction simulation

## Key Dependencies Overview

### File Upload Implementation
```javascript
import { FilePond } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
```

### Stripe Integration
```javascript
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('your_public_key');
```

### Notifications
```javascript
import { SnackbarProvider, enqueueSnackbar } from 'notistack';

// Show notification
enqueueSnackbar('Success!', { variant: 'success' });
```

## Project Structure (Recommended)

```
client/
├── public/           # Static assets
└── src/
   ├── components/   # Reusable components
   ├── contexts/     # Global contexts
   ├── pages/        # Page components
   ├── utils/        # Utility functions
   └── services/     # API services
```


## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**Note:** This is a client-side application that connects to a backend server running on `http://localhost:8000`.
# Mood Music Platform Frontend

This is the frontend application for the Mood Music Platform, built with React, TypeScript, and Vite.

## Features

- Modern UI with dark/light mode support
- Interactive password management components
- Real-time form validation
- Spotify integration
- Responsive design
- Accessibility-focused components

## Technology Stack

- React 18+
- TypeScript
- Vite
- Tailwind CSS
- Shadcn/ui components
- ESLint + TypeScript ESLint

## Development Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
```env
# Backend API URL
VITE_API_URL=https://localhost:8000

# Spotify API Configuration
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `https://localhost:3000`.

## Environment Variables

| Variable | Description | Example Value |
|----------|-------------|---------------|
| VITE_API_URL | Backend API URL | https://localhost:8000 |
| VITE_SPOTIFY_CLIENT_ID | Spotify API client ID | (from Spotify Developer Dashboard) |
| VITE_SPOTIFY_CLIENT_SECRET | Spotify API client secret | (from Spotify Developer Dashboard) |

## Build

To create a production build:

```bash
npm run build
```

The build output will be in the `dist` directory.

## ESLint Configuration

The project uses a modern ESLint configuration with TypeScript support. To enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    ...tseslint.configs.recommendedTypeChecked,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run preview` - Preview production build locally

## SSL Configuration

The development server uses SSL certificates for HTTPS. The certificates should be placed in the `certs` directory:
- `certs/cert.pem` - SSL certificate
- `certs/key.pem` - SSL private key

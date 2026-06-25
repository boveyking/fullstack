# AWS Xray Automation Frontend

React + TypeScript frontend for AWS Xray Automation system.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

The application will be available at http://localhost:3000

## Build for Production

```bash
npm run build
```

This will run TypeScript compilation followed by Vite build.

## Type Checking

```bash
npx tsc --noEmit
```

## Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable UI components (TypeScript)
│   ├── pages/           # Page components (TypeScript)
│   ├── services/        # API client and services (TypeScript)
│   ├── types/           # TypeScript type definitions
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Application entry point
│   └── vite-env.d.ts    # Vite environment types
├── index.html           # HTML template
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
└── tsconfig.node.json   # TypeScript config for Node
```

## Technologies

- React 18
- TypeScript 5.3
- React Router v6
- Material-UI (MUI)
- Axios
- Vite

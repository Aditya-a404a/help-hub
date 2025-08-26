# Help Hub

A modern web application built with Next.js and Tailwind CSS, designed to be your central platform for getting help and finding solutions.

## Features

- **Modern UI**: Built with Tailwind CSS and Radix UI components
- **Responsive Design**: Works seamlessly across all devices
- **Theme Support**: Light and dark mode with system preference detection
- **Fast Performance**: Built with Next.js for optimal performance
- **AI Integration**: Google Gemini AI integration for intelligent assistance
- **Weather Data**: Real-time weather information
- **Disaster Response**: Emergency management and relief center locator

## Tech Stack

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible UI components
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [next-themes](https://github.com/pacocoursey/next-themes) - Theme management
- [Google Gemini AI](https://ai.google.dev/) - AI-powered assistance
- [Supabase](https://supabase.com/) - Backend as a service

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (see `ENVIRONMENT_VARIABLES.md`)

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run deploy:build` - Lint and build for deployment
- `npm run deploy:test` - Build and test production build locally
- `npm run deploy:vercel` - Deploy to Vercel (requires Vercel CLI)

## Deployment

This project is ready for deployment to various platforms:

- **Vercel** (Recommended) - See `DEPLOYMENT.md` for detailed instructions
- **Netlify** - Static hosting with serverless functions
- **Railway** - Full-stack hosting platform
- **Self-hosting** - Traditional server deployment

For detailed deployment instructions, see `DEPLOYMENT.md`.

## Environment Variables

Required environment variables are documented in `ENVIRONMENT_VARIABLES.md`. Make sure to set these before deploying.

## Project Structure

```
help-hub/
├── app/                 # Next.js app directory
├── components/          # Reusable UI components
├── lib/                 # Utility functions and services
├── public/              # Static assets
├── scripts/             # Deployment and utility scripts
└── docs/                # Documentation files
```

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the [MIT License](LICENSE).

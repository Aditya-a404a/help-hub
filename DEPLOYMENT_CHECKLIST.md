# Deployment Checklist

Use this checklist to ensure your Help Hub project is ready for deployment.

## Pre-Deployment Checklist

### ✅ Build Verification
- [ ] `npm run build` completes successfully
- [ ] No TypeScript compilation errors
- [ ] No ESLint errors
- [ ] All pages generate correctly

### ✅ Environment Variables
- [ ] `GOOGLE_GENERATIVE_AI_API_KEY` is set
- [ ] `NEXT_PUBLIC_OPENWEATHER_API_KEY` is set
- [ ] `NODE_ENV=production` is set
- [ ] `NEXT_PUBLIC_DISASTER_API_BASE_URL` is set (if using external API)

### ✅ Dependencies
- [ ] All dependencies are in `package.json`
- [ ] No dev dependencies are required in production
- [ ] Node.js version is 18+ (check with `node --version`)

### ✅ Configuration
- [ ] `next.config.ts` is properly configured
- [ ] `tsconfig.json` has correct settings
- [ ] `tailwind.config.ts` is configured
- [ ] `postcss.config.mjs` is present

### ✅ Static Assets
- [ ] `public/` folder contains all required assets
- [ ] Images are optimized
- [ ] Favicon and meta images are present

## Deployment Platform Checklist

### Vercel
- [ ] Repository is connected to Vercel
- [ ] Environment variables are set in Vercel dashboard
- [ ] Build command is `npm run build`
- [ ] Output directory is `.next`

### Netlify
- [ ] Build command: `npm run build`
- [ ] Publish directory: `.next`
- [ ] Environment variables are set
- [ ] Functions are properly configured

### Self-Hosting
- [ ] Server has Node.js 18+
- [ ] Process manager (PM2) is installed
- [ ] Reverse proxy (nginx) is configured
- [ ] SSL certificate is installed
- [ ] Firewall rules are configured

## Post-Deployment Verification

### ✅ Functionality
- [ ] Homepage loads correctly
- [ ] All navigation works
- [ ] API endpoints respond
- [ ] External integrations work
- [ ] Forms submit successfully

### ✅ Performance
- [ ] Page load times are acceptable
- [ ] Images load properly
- [ ] No console errors
- [ ] Mobile responsiveness works

### ✅ Security
- [ ] Environment variables are not exposed
- [ ] API keys are secure
- [ ] HTTPS is enabled
- [ ] No sensitive data in client code

## Quick Commands

```bash
# Test build locally
npm run deploy:test

# Build for deployment
npm run deploy:build

# Deploy to Vercel
npm run deploy:vercel

# Check production build
npm run build && npm run start
```

## Troubleshooting

If deployment fails:
1. Check build logs for errors
2. Verify environment variables
3. Test build locally first
4. Check hosting platform requirements
5. Review error logs and fix issues

## Support

- Check `DEPLOYMENT.md` for detailed instructions
- Review hosting platform documentation
- Check Next.js deployment documentation
- Verify all environment variables are set correctly

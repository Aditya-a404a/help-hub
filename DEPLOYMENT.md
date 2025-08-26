# Help Hub Deployment Guide

This guide covers deploying Help Hub to various hosting platforms.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git repository access
- API keys for external services

## Build Verification

Before deploying, verify your project builds successfully:

```bash
# Install dependencies
npm install

# Run linting
npm run lint

# Build the project
npm run build

# Test production build locally
npm run start
```

## Deployment Options

### 1. Vercel (Recommended)

Vercel is the easiest platform for Next.js applications.

#### Automatic Deployment
1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect Next.js and configure the build
3. Set environment variables in Vercel dashboard
4. Deploy automatically on every push to main branch

#### Manual Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Environment Variables for Vercel
Set these in your Vercel project dashboard:
- `GOOGLE_GENERATIVE_AI_API_KEY`
- `NEXT_PUBLIC_OPENWEATHER_API_KEY`
- `NEXT_PUBLIC_DISASTER_API_BASE_URL`
- `NODE_ENV=production`

### 2. Netlify

1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Add environment variables in Netlify dashboard

### 3. Railway

1. Connect your GitHub repository
2. Railway will auto-detect Next.js
3. Set environment variables
4. Deploy automatically

### 4. Self-Hosting

#### Requirements
- Node.js 18+ server
- Reverse proxy (nginx recommended)
- SSL certificate
- Process manager (PM2 recommended)

#### Deployment Steps
```bash
# On your server
git clone <your-repo>
cd help-hub
npm install --production
npm run build

# Use PM2 to manage the process
npm install -g pm2
pm2 start npm --name "help-hub" -- start
pm2 startup
pm2 save
```

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Environment Variables

### Required for Production
- `NODE_ENV=production`
- `GOOGLE_GENERATIVE_AI_API_KEY`
- `NEXT_PUBLIC_OPENWEATHER_API_KEY`

### Optional
- `NEXT_PUBLIC_DISASTER_API_BASE_URL`
- `ANALYZE=false`

## Post-Deployment Checklist

- [ ] Verify all pages load correctly
- [ ] Test API endpoints
- [ ] Check environment variables are set
- [ ] Verify external API integrations work
- [ ] Test responsive design on mobile devices
- [ ] Check performance with Lighthouse
- [ ] Monitor error logs
- [ ] Set up monitoring and alerts

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version (must be 18+)
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **API Errors**
   - Verify environment variables are set
   - Check API key validity
   - Ensure external services are accessible

3. **Performance Issues**
   - Enable compression in next.config.ts
   - Optimize images and assets
   - Use CDN for static assets

4. **Environment Variable Issues**
   - Ensure variables are set in hosting platform
   - Check variable names match exactly
   - Restart deployment after setting variables

## Monitoring and Maintenance

- Set up error tracking (Sentry, LogRocket)
- Monitor performance metrics
- Regular dependency updates
- Security audits
- Backup strategies

## Support

For deployment issues:
1. Check the build logs
2. Verify environment configuration
3. Test locally with production build
4. Check hosting platform documentation

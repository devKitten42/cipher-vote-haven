# Vercel Deployment Guide for Cipher Vote Haven

This guide provides step-by-step instructions for deploying the Cipher Vote Haven application to Vercel.

## Prerequisites

- Vercel account (free tier available)
- GitHub account with access to the repository
- Node.js 18+ installed locally (for testing)

## Step 1: Prepare the Repository

1. Ensure all code is committed and pushed to the main branch
2. Verify the following files exist in the root directory:
   - `package.json`
   - `vite.config.ts`
   - `tsconfig.json`
   - `tailwind.config.ts`

## Step 2: Create Vercel Account and Connect GitHub

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up" and choose "Continue with GitHub"
3. Authorize Vercel to access your GitHub repositories
4. Complete the account setup process

## Step 3: Import Project to Vercel

1. In the Vercel dashboard, click "New Project"
2. Find and select the `devKitten42/cipher-vote-haven` repository
3. Click "Import" to proceed

## Step 4: Configure Build Settings

Vercel should automatically detect this as a Vite project. Verify the following settings:

### Build Command
```
npm run build
```

### Output Directory
```
dist
```

### Install Command
```
npm install
```

### Development Command
```
npm run dev
```

## Step 5: Environment Variables Configuration

In the Vercel project settings, add the following environment variables:

### Required Environment Variables

| Variable Name | Value | Description |
|---------------|-------|-------------|
| `NEXT_PUBLIC_CHAIN_ID` | `11155111` | Sepolia testnet chain ID |
| `NEXT_PUBLIC_RPC_URL` | `https://sepolia.infura.io/v3/b18fb7e6ca7045ac83c41157ab93f990` | Sepolia RPC endpoint |
| `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` | `2ec9743d0d0cd7fb94dee1a7e6d33475` | WalletConnect project ID |
| `NEXT_PUBLIC_INFURA_API_KEY` | `b18fb7e6ca7045ac83c41157ab93f990` | Infura API key |
| `NEXT_PUBLIC_RPC_URL` | `https://1rpc.io/sepolia` | Alternative RPC endpoint |

### How to Add Environment Variables

1. In your Vercel project dashboard, go to "Settings"
2. Click on "Environment Variables" in the left sidebar
3. Add each variable with the following settings:
   - **Name**: The variable name (e.g., `NEXT_PUBLIC_CHAIN_ID`)
   - **Value**: The corresponding value
   - **Environment**: Select "Production", "Preview", and "Development"
4. Click "Save" after adding each variable

## Step 6: Deploy the Application

1. After configuring all settings, click "Deploy" in the Vercel dashboard
2. Wait for the build process to complete (usually 2-5 minutes)
3. Once deployed, you'll receive a production URL (e.g., `https://cipher-vote-haven.vercel.app`)

## Step 7: Verify Deployment

1. Visit the deployed URL
2. Test the following features:
   - Page loads correctly
   - Wallet connection works
   - UI components render properly
   - Responsive design works on mobile

## Step 8: Custom Domain (Optional)

If you want to use a custom domain:

1. In Vercel project settings, go to "Domains"
2. Add your custom domain
3. Follow the DNS configuration instructions
4. Wait for SSL certificate to be issued

## Step 9: Continuous Deployment

Vercel automatically deploys when you push to the main branch:

1. Make changes to your code
2. Commit and push to GitHub
3. Vercel will automatically trigger a new deployment
4. Preview deployments are created for pull requests

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check that all dependencies are in `package.json`
   - Verify TypeScript configuration
   - Check build logs in Vercel dashboard

2. **Environment Variables Not Working**
   - Ensure variables start with `NEXT_PUBLIC_` for client-side access
   - Redeploy after adding new environment variables
   - Check variable names match exactly

3. **Wallet Connection Issues**
   - Verify WalletConnect project ID is correct
   - Check RPC URLs are accessible
   - Ensure chain ID matches your target network

4. **Styling Issues**
   - Verify Tailwind CSS is properly configured
   - Check that all CSS files are imported
   - Ensure PostCSS configuration is correct

### Performance Optimization

1. **Enable Vercel Analytics**
   - Go to project settings
   - Enable "Vercel Analytics" for performance monitoring

2. **Configure Caching**
   - Vercel automatically handles static asset caching
   - Consider implementing service worker for offline functionality

3. **Image Optimization**
   - Use Vercel's built-in image optimization
   - Optimize images before uploading

## Security Considerations

1. **Environment Variables**
   - Never commit sensitive keys to the repository
   - Use Vercel's environment variable system
   - Rotate API keys regularly

2. **HTTPS**
   - Vercel automatically provides HTTPS
   - Ensure all external resources use HTTPS

3. **Content Security Policy**
   - Consider implementing CSP headers
   - Configure in `vercel.json` if needed

## Monitoring and Maintenance

1. **Check Deployment Status**
   - Monitor deployment logs in Vercel dashboard
   - Set up notifications for failed deployments

2. **Performance Monitoring**
   - Use Vercel Analytics
   - Monitor Core Web Vitals
   - Set up error tracking (e.g., Sentry)

3. **Regular Updates**
   - Keep dependencies updated
   - Monitor for security vulnerabilities
   - Test deployments in preview environment first

## Support

- Vercel Documentation: [vercel.com/docs](https://vercel.com/docs)
- Vercel Community: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
- Project Repository: [github.com/devKitten42/cipher-vote-haven](https://github.com/devKitten42/cipher-vote-haven)

## Deployment Checklist

- [ ] Repository is connected to Vercel
- [ ] Build settings are configured correctly
- [ ] All environment variables are set
- [ ] Application builds successfully
- [ ] Production URL is accessible
- [ ] Wallet connection works
- [ ] All features are functional
- [ ] Performance is acceptable
- [ ] Security measures are in place

---

**Note**: This deployment guide assumes you're using the free Vercel tier. For production applications with high traffic, consider upgrading to a paid plan for better performance and support.

# Unique Validation

A modern web application for creating, managing, and validating e-learning certificates with QR code verification. Perfect for hackathons, demos, and educational platforms.

## Features

- **Public Certificate Validation**: Verify certificates by ID or QR code scan
- **Admin Portal**: Create and manage certificates (accessible via direct URL)
- **QR Code Generation**: Each certificate includes a scannable QR code
- **Certificate Downloads**: Download certificates as images
- **Secure Authentication**: Admin-only access to management features

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TailwindCSS
- **Authentication**: NextAuth.js with credentials provider
- **Data Storage**: In-memory database (mock for hackathon demo)
- **QR Code**: qrcode, @zxing/browser for scanning
- **Form Handling**: react-hook-form with zod validation
- **Image Generation**: html-to-image

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:
   - Create a `.env.local` file with the following:
   ```
   NEXTAUTH_SECRET=your-secret-for-hackathon-demo
   NEXTAUTH_URL=http://localhost:3000
   ```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Admin Access

The admin portal is accessible only by directly navigating to the `/admin` URL.

Use these credentials to access the admin portal:

- **Username**: abdellah
- **Password**: abde123

## Deployment to Vercel

This application is optimized for deployment on Vercel. Follow these steps to deploy:

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for production deployment"
   git push
   ```

2. **Connect to Vercel**:
   - Log in to [Vercel](https://vercel.com)
   - Create a new project and import your GitHub repository
   - Configure the project settings:
     - Framework Preset: Next.js
     - Root Directory: ./

3. **Set Environment Variables**:
   In the Vercel dashboard, add these environment variables:
   ```
   NEXTAUTH_SECRET=<generate-a-secure-random-string>
   NEXTAUTH_URL=https://your-vercel-domain.vercel.app
   NEXT_PUBLIC_BASE_URL=https://your-vercel-domain.vercel.app
   ```

4. **Deploy**:
   - Click "Deploy" and wait for the build to complete
   - Your application will be available at the provided Vercel URL

## Production Database Setup

The application currently uses an in-memory database which resets when the server restarts. For production use, follow these steps to integrate with Vercel KV:

1. **Add Vercel KV to your project**:
   ```bash
   npx vercel link
   npx vercel add kv
   ```

2. **Install the KV package**:
   ```bash
   npm install @vercel/kv
   ```

3. **Update the database implementation**:
   - The `src/lib/db.ts` file is already prepared with placeholders for Vercel KV
   - Uncomment the KV implementation code and import the KV client

## Branding

The application uses the Unique branding with:
- Green color scheme (#10B981) for buttons and accents
- White navbar with green text
- Inter font for modern typography
- Unique logo in the header

## Security Notes

- Admin routes are protected by authentication middleware
- Admin panel is hidden from navigation for security
- QR codes use absolute URLs in production for proper validation
- For a production environment, consider implementing:
  - Rate limiting
  - CSRF protection
  - More robust authentication

## License

This project is licensed under the MIT License - see the LICENSE file for details.

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

## Demo Flow

1. **Home Page**: Enter a certificate ID or scan a QR code
2. **Admin Login**: Access the admin portal at `/login` (after navigating to `/admin`)
3. **Admin Dashboard**: View all certificates
4. **Create Certificate**: Generate a new certificate with student details
5. **Certificate Detail**: View, download and share certificates

## Deployment

This application is ready to deploy on Vercel:

1. Push to GitHub
2. Connect to Vercel
3. Set the `NEXTAUTH_SECRET` environment variable
4. Deploy!

## Project Structure

- `/src/app`: Next.js App Router pages
- `/src/components`: Reusable React components
- `/src/lib`: Utility functions and business logic
  - `db.ts`: Mock database implementation
  - `qrcode.ts`: QR code generation utilities
  - `certificate.ts`: Certificate template generation
  - `auth.ts`: NextAuth.js configuration

## Branding

The application uses the Unique branding with a green color scheme and the Unique logo. The admin panel is hidden from the main navigation for security purposes and is only accessible by directly navigating to `/admin`.

## Future Enhancements

- Replace mock database with Vercel KV or another database
- Add email notifications for certificate issuance
- Implement certificate revocation workflow
- Add analytics for certificate verification

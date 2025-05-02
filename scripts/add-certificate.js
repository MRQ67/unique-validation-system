// Script to add a specific certificate to the Vercel KV database
// Run this script with: node scripts/add-certificate.js

const { createClient } = require('@vercel/kv');

// Initialize KV client with environment variables
// These will be automatically set when you create a KV database in Vercel
const kv = createClient({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

async function addCertificate() {
  try {
    // Certificate data
    const certificate = {
      certificateId: 'CERT-4788-5830',
      studentName: 'Fuad Abdella',
      courseName: 'Software Engineering',
      issueDate: '2025-05-03',
      expiryDate: '2029-06-02',
      status: 'valid'
    };

    // Add to KV database
    await kv.set(`certificate:${certificate.certificateId}`, certificate);
    console.log(`Certificate ${certificate.certificateId} added successfully!`);
    
    // Verify it was added
    const storedCertificate = await kv.get(`certificate:${certificate.certificateId}`);
    console.log('Stored certificate:', storedCertificate);
  } catch (error) {
    console.error('Error adding certificate:', error);
  }
}

addCertificate();

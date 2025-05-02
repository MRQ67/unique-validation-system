import { Certificate } from './db';
import { generateQRCode } from './qrcode';
import { toPng } from 'html-to-image';

/**
 * Generate a certificate template with embedded QR code
 */
export const generateCertificateTemplate = async (certificate: Certificate, baseUrl: string): Promise<string> => {
  // Generate QR code for validation URL
  const validationUrl = `${baseUrl}/validate/${certificate.certificateId}`;
  const qrCodeDataUrl = await generateQRCode(validationUrl);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Create certificate HTML template
  const certificateHtml = `
    <div style="
      width: 800px;
      height: 600px;
      background-color: white;
      border: 8px solid #BFDBFE;
      border-radius: 12px;
      padding: 40px;
      font-family: system-ui, -apple-system, sans-serif;
      background-image: radial-gradient(circle, rgba(235,245,255,1) 0%, rgba(255,255,255,1) 100%);
      position: relative;
    ">
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="font-size: 32px; font-weight: bold; color: #1E40AF; margin-bottom: 10px;">Certificate of Completion</h1>
        <div style="width: 120px; height: 4px; background-color: #2563EB; margin: 0 auto;"></div>
      </div>
      
      <div style="text-align: center; margin-bottom: 40px;">
        <p style="color: #4B5563; margin-bottom: 10px;">This is to certify that</p>
        <h2 style="font-size: 28px; font-weight: bold; color: #1F2937; margin-bottom: 10px; font-family: serif;">${certificate.studentName}</h2>
        <p style="color: #4B5563; margin-bottom: 20px;">has successfully completed the course</p>
        <h3 style="font-size: 24px; font-weight: bold; color: #2563EB; margin-bottom: 10px;">"${certificate.courseName}"</h3>
        <p style="color: #4B5563;">
          on ${formatDate(certificate.issueDate)}
          ${certificate.expiryDate ? ` (Valid until ${formatDate(certificate.expiryDate)})` : ''}
        </p>
      </div>
      
      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 80px;">
        <div>
          <div style="width: 150px; height: 1px; background-color: #9CA3AF; margin-bottom: 10px;"></div>
          <p style="color: #4B5563;">Authorized Signature</p>
        </div>
        
        <div style="text-align: center;">
          <img 
            src="${qrCodeDataUrl}" 
            alt="Certificate Validation QR Code" 
            style="width: 120px; height: 120px; margin-bottom: 10px;"
          />
          <p style="font-size: 12px; color: #6B7280;">Scan to verify</p>
          <p style="font-size: 12px; color: #6B7280;">${certificate.certificateId}</p>
        </div>
        
        <div>
          <div style="width: 150px; height: 1px; background-color: #9CA3AF; margin-bottom: 10px;"></div>
          <p style="color: #4B5563;">Date Issued</p>
        </div>
      </div>
    </div>
  `;
  
  return certificateHtml;
};

/**
 * Convert HTML certificate to an image
 */
export const certificateHtmlToImage = async (htmlElement: HTMLElement): Promise<string> => {
  try {
    const dataUrl = await toPng(htmlElement, {
      quality: 1.0,
      pixelRatio: 2
    });
    
    return dataUrl;
  } catch (error) {
    console.error('Error generating certificate image:', error);
    throw new Error('Failed to generate certificate image');
  }
};

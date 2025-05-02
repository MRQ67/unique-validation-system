import QRCode from 'qrcode';

// Get the base URL from environment or default to localhost
const getBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
};

// Generate QR code as data URL with absolute URL
export async function generateQRCode(text: string, transparent: boolean = false): Promise<string> {
  try {
    // If the text is a relative URL (starts with /), make it absolute
    const qrText = text.startsWith('/') ? `${getBaseUrl()}${text}` : text;
    
    const qrCodeDataUrl = await QRCode.toDataURL(qrText, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 200,
      color: {
        dark: '#000000',
        light: transparent ? '#00000000' : '#ffffff'
      }
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

// Generate QR code as SVG string with absolute URL
export async function generateQRCodeSVG(text: string, transparent: boolean = false): Promise<string> {
  try {
    // If the text is a relative URL (starts with /), make it absolute
    const qrText = text.startsWith('/') ? `${getBaseUrl()}${text}` : text;
    
    const qrCodeSvg = await QRCode.toString(qrText, {
      type: 'svg',
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 200,
      color: {
        dark: '#000000',
        light: transparent ? '#00000000' : '#ffffff'
      }
    });
    return qrCodeSvg;
  } catch (error) {
    console.error('Error generating QR code SVG:', error);
    throw new Error('Failed to generate QR code SVG');
  }
}

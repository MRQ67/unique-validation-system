import QRCode from 'qrcode';

// Generate QR code as data URL
export async function generateQRCode(text: string, transparent: boolean = false): Promise<string> {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(text, {
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

// Generate QR code as SVG string
export async function generateQRCodeSVG(text: string, transparent: boolean = false): Promise<string> {
  try {
    const qrCodeSvg = await QRCode.toString(text, {
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

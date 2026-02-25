import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import QRCode from 'qrcode';
import type { OrderWithItems, User, OrderStatus } from '@shared/schema';

const logoPath = path.resolve(process.cwd(), "server/assets/logo.png");
const signaturePath = path.resolve(process.cwd(), "server/assets/signature.png");


let logoBase64 = '';
let signatureBase64 = '';

try {
  const logoBuffer = fs.readFileSync(logoPath);
  logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
} catch (error) {
  console.error('Failed to load logo:', error);
}

try {
  const signatureBuffer = fs.readFileSync(signaturePath);
  signatureBase64 = `data:image/png;base64,${signatureBuffer.toString('base64')}`;
} catch (error) {
  console.error('Failed to load signature:', error);
}

export const orderInvoiceTemplate = (order: OrderWithItems, user: User, qrCodeDataUrl: string) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice - ${order.orderNumber}</title>
  <style>
    @page {
      size: A4;
      margin: 10mm;
    }

    body {
      font-family: Arial, sans-serif;
      font-size: 12px;
      line-height: 1.4;
      color: #333;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
      border: 1px solid #ddd;
      padding: 20px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #D97706;
    }

    .logo-section {
      flex: 1;
    }

    .logo {
      max-height: 60px;
      max-width: 200px;
      object-fit: contain;
    }

    .invoice-info {
      text-align: right;
      flex: 1;
    }

    .invoice-title {
      font-size: 24px;
      font-weight: bold;
      color: #D97706;
      margin-bottom: 10px;
    }

    .invoice-details {
      font-size: 11px;
      color: #666;
    }

    .invoice-details div {
      margin: 3px 0;
    }

    .addresses {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-bottom: 30px;
    }

    .address-box {
      padding: 15px;
      background: #f9fafb;
      border-radius: 4px;
    }

    .address-title {
      font-weight: bold;
      font-size: 13px;
      color: #D97706;
      margin-bottom: 8px;
      text-transform: uppercase;
    }

    .address-content {
      font-size: 11px;
      line-height: 1.6;
    }

    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }

    .items-table th {
      background: #f8f9fa;
      border: 1px solid #ddd;
      padding: 10px 8px;
      text-align: left;
      font-weight: bold;
      font-size: 11px;
      color: #333;
    }

    .items-table td {
      border: 1px solid #ddd;
      padding: 10px 8px;
      font-size: 11px;
      vertical-align: top;
    }

    .text-center {
      text-align: center;
    }

    .text-right {
      text-align: right;
    }

    .total-row {
      font-weight: bold;
      font-size: 13px;
      background: #f9fafb;
    }

    .total-row td {
      border-top: 2px solid #D97706;
      padding: 12px 8px;
    }

    .footer-section {
      margin-top: 40px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }

    .qr-section {
      flex: 0 0 auto;
    }

    .qr-code {
      width: 100px;
      height: 100px;
    }

    .qr-label {
      font-size: 9px;
      color: #666;
      text-align: center;
      margin-top: 5px;
    }

    .signature-section {
      text-align: right;
      flex: 1;
    }

    .signature-image {
      max-height: 60px;
      margin-bottom: 5px;
      display: inline-block;
    }

    .signature-text {
      font-size: 11px;
      font-weight: bold;
      color: #333;
    }

    .company-name {
      font-size: 12px;
      font-weight: bold;
      color: #D97706;
      margin-top: 3px;
    }

    .footer-info {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      font-size: 10px;
      color: #666;
      text-align: center;
      line-height: 1.6;
    }

    .bold {
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="logo-section">
        <img src="${logoBase64}" alt="Lumera Logo" class="logo">
      </div>
      <div class="invoice-info">
        <div class="invoice-title">INVOICE</div>
        <div class="invoice-details">
          <div><span class="bold">Invoice No:</span> #${order.orderNumber}</div>
          <div><span class="bold">Order No:</span> ${order.orderNumber}</div>
          <div><span class="bold">Date:</span> ${new Date(order.createdAt).toLocaleDateString('en-AE', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          <div><span class="bold">Payment:</span> ${order.paymentStatus === 'paid' ? 'Paid' : 'Cash on Delivery'}</div>
        </div>
      </div>
    </div>

    <!-- Addresses -->
    <div class="addresses">
      <div class="address-box">
        <div class="address-title">Bill To</div>
        <div class="address-content">
          <div class="bold">${order.shippingName}</div>
          <div>${order.shippingPhone}</div>
          <div>${order.shippingAddress}</div>
          <div>${order.shippingCity}, ${order.shippingEmirate}</div>
        </div>
      </div>
      <div class="address-box">
        <div class="address-title">From</div>
        <div class="address-content">
          <div class="bold">Lumera</div>
          <div>Based in India</div>
          <div>Himalayan producers network</div>
          <div>kaushlendra.k12@fms.edu</div>
        </div>
      </div>
    </div>

    <!-- Items Table -->
    <table class="items-table">
      <thead>
        <tr>
          <th>Item</th>
          <th class="text-center">Qty</th>
          <th class="text-right">Price</th>
          <th class="text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${order.orderItems.map(item => `
        <tr>
          <td>${item.productName}</td>
          <td class="text-center">${item.quantity}</td>
          <td class="text-right">${parseFloat(item.productPrice).toFixed(2)} AED</td>
          <td class="text-right">${(parseFloat(item.productPrice) * item.quantity).toFixed(2)} AED</td>
        </tr>
        `).join('')}
        <tr class="total-row">
          <td colspan="3" class="text-right">Total Amount</td>
          <td class="text-right">${parseFloat(order.totalAmount).toFixed(2)} AED</td>
        </tr>
      </tbody>
    </table>

    <!-- Footer with QR and Signature -->
    <div class="footer-section">
      <div class="qr-section">
        <img src="${qrCodeDataUrl}" alt="Invoice QR Code" class="qr-code">
        <div class="qr-label">Scan to verify</div>
      </div>
      <div class="signature-section">
        <img src="${signatureBase64}" alt="Authorized Signature" class="signature-image">
        <div class="signature-text">(Authorized Signatory)</div>
        <div class="company-name">Lumera</div>
      </div>
    </div>

    <!-- Footer Info -->
    <div class="footer-info">
        <div class="bold">Thank you for your purchase!</div>
      <div>Lumera | Based in India — perfumery & sourcing network | kaushlendra.k12@fms.edu</div>
      <div>For support, contact us at kaushlendra.k12@fms.edu</div>
    </div>
  </div>
</body>
</html>`;

export async function generateInvoicePDF(order: OrderWithItems, user: User): Promise<Buffer> {
  let browser;
  try {
    // Generate QR Code with order information
    const qrData = `Invoice: ${order.orderNumber}\nAmount: ${order.totalAmount} AED\nDate: ${new Date(order.createdAt).toISOString()}`;
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 200,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Generate HTML from template
    const html = orderInvoiceTemplate(order, user, qrCodeDataUrl);

    // Launch puppeteer with more compatible settings
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-extensions'
      ],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined
    });

    const page = await browser.newPage();

    // Set content with timeout
    await page.setContent(html, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    // Wait a bit for images to load
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate PDF with proper settings
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: false,
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm'
      }
    });

    await browser.close();

    return Buffer.from(pdfBuffer);
  } catch (error) {
    if (browser) {
      await browser.close().catch(() => {});
    }
    console.error('Error generating PDF:', error);
    throw new Error(`Failed to generate invoice PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function canTransitionOrderStatus(
  current: OrderStatus,
  next: OrderStatus
): boolean {
  if (current === next) return false;

  const transitions: Record<OrderStatus, OrderStatus[]> = {
    pending: ["processing", "cancelled"],

    processing: ["shipped"],

    shipped: ["delivered", "cancelled"],

    delivered: ["returning"],

    returning: ["returned"],

    returned: ["refunded"],

    cancelled: [],

    refunded: [],
  };

  return transitions[current]?.includes(next) ?? false;
}

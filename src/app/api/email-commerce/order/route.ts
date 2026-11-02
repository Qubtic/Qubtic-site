import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { settings, customer = {}, lines = [], total } = body;

    if (!lines || !lines.length) {
      return NextResponse.json(
        { success: false, message: 'Order must contain at least one product.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const merchantEmail = (settings?.merchantEmail || process.env.CONTACT_RECEIVER_EMAIL || 'hello@qubtic.tech').trim();
    const businessName = settings?.business || 'Store';
    const currency = settings?.currency || lines[0]?.currency || 'USD';
    const orderId = `ORD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Contact and fulfillment information
    const rawPhone = (customer.phone || '').trim();
    const cleanPhone = rawPhone.replace(/[^\d+]/g, '');
    const channelPref = (customer.numberType || customer.channelPreference || 'all').toLowerCase();
    const productType = (customer.productType || 'physical').toLowerCase();
    const paymentMethod = (customer.paymentMethod || 'cod').toLowerCase();

    const paymentLabels: Record<string, string> = {
      cod: 'Cash on Delivery (Pay upon delivery)',
      bank_transfer: 'Direct Bank Transfer / Wire',
      online_invoice: 'Online Payment Link / Digital Invoice',
      pickup: 'Pay on In-Store Pickup',
    };
    const paymentLabel = paymentLabels[paymentMethod] || customer.paymentMethod || 'Cash on Delivery';

    const channelLabels: Record<string, string> = {
      whatsapp: 'WhatsApp',
      call: 'Direct Phone Call',
      telegram: 'Telegram',
      all: 'Any Channel (WhatsApp, Call, or Telegram)',
    };
    const channelLabel = channelLabels[channelPref] || 'WhatsApp / Phone';

    // Lead action links for seller convenience
    const waLink = cleanPhone ? `https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent(`Hi ${customer.name || ''}, regarding your order #${orderId} from ${businessName}...`)}` : '';
    const tgLink = cleanPhone ? `https://t.me/${cleanPhone.replace('+', '')}` : '';
    const telLink = rawPhone ? `tel:${rawPhone}` : '';

    let quickLeadButtonsHtml = '';
    if (cleanPhone) {
      const buttons = [];
      if (channelPref === 'whatsapp' || channelPref === 'all') {
        buttons.push(`<a href="${waLink}" style="display:inline-block; padding:8px 14px; background:#25D366; color:#ffffff; font-weight:600; text-decoration:none; border-radius:6px; font-size:13px; margin-right:8px; margin-bottom:6px;">💬 Chat on WhatsApp</a>`);
      }
      if (channelPref === 'telegram' || channelPref === 'all') {
        buttons.push(`<a href="${tgLink}" style="display:inline-block; padding:8px 14px; background:#229ED9; color:#ffffff; font-weight:600; text-decoration:none; border-radius:6px; font-size:13px; margin-right:8px; margin-bottom:6px;">✈️ Message on Telegram</a>`);
      }
      if (channelPref === 'call' || channelPref === 'all') {
        buttons.push(`<a href="${telLink}" style="display:inline-block; padding:8px 14px; background:#0f172a; color:#ffffff; font-weight:600; text-decoration:none; border-radius:6px; font-size:13px; margin-right:8px; margin-bottom:6px;">📞 Call Buyer</a>`);
      }
      quickLeadButtonsHtml = `
        <div style="margin-top:12px; padding:12px; background:#f1f5f9; border-radius:6px;">
          <strong style="display:block; margin-bottom:8px; font-size:12px; color:#475569; text-transform:uppercase;">Quick Seller Lead Actions:</strong>
          ${buttons.join(' ')}
        </div>
      `;
    }

    // Configure SMTP transport using provided settings or environment defaults
    const host = settings?.smtpHost || process.env.SMTP_HOST || 'smtp.mailgun.org';
    const port = Number(settings?.smtpPort) || parseInt(process.env.SMTP_PORT || '587', 10);
    const secure = settings?.smtpSecure ?? (process.env.SMTP_SECURE === 'true' || port === 465);
    const user = settings?.smtpUser || process.env.SMTP_USER || '';
    const pass = settings?.smtpPass || process.env.SMTP_PASS || '';

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user && pass ? { user, pass } : undefined,
      tls: {
        rejectUnauthorized: false,
      },
    });

    const fromSenderName = settings?.fromName || businessName;
    const fromSenderEmail = settings?.fromEmail || user || 'orders@qubtic.tech';
    const formattedFrom = `"${fromSenderName}" <${fromSenderEmail}>`;

    const formattedTotal = typeof total === 'number' ? `$${total.toFixed(2)} ${currency}` : `${currency} ${total || ''}`;

    const itemsHtml = lines
      .map(
        (l: any) => `
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #1e293b;">
            <strong>${l.name || 'Product'}</strong><br/>
            <span style="font-size: 12px; color: #64748b;">SKU: ${l.sku || 'N/A'}</span>
          </td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; text-align: center; color: #1e293b;">
            ${l.quantity}
          </td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; text-align: right; color: #1e293b;">
            $${Number(l.price || 0).toFixed(2)}
          </td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; text-align: right; font-weight: 600; color: #0f172a;">
            $${(Number(l.price || 0) * (l.quantity || 1)).toFixed(2)}
          </td>
        </tr>
      `
      )
      .join('');

    // 1. Merchant Order Email
    const merchantMailOptions = {
      from: formattedFrom,
      to: merchantEmail,
      replyTo: customer.email ? `"${customer.name || 'Customer'}" <${customer.email}>` : undefined,
      subject: `[New Order #${orderId}] ${businessName} - ${formattedTotal}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a;">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden;">
            <tr>
              <td style="padding: 24px; background: #0f172a; color: #ffffff;">
                <h1 style="margin: 0; font-size: 20px; font-weight: 700;">${businessName}</h1>
                <p style="margin: 4px 0 0; font-size: 13px; color: #94a3b8;">New Order Notification #${orderId}</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 24px;">
                <h3 style="margin: 0 0 12px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #475569;">Customer & Lead Details</h3>
                <table width="100%" style="font-size: 13px; color: #334155; margin-bottom: 16px;">
                  <tr><td style="padding: 4px 0; width: 140px; font-weight: 600;">Customer Name:</td><td>${customer.name || 'Not provided'}</td></tr>
                  <tr><td style="padding: 4px 0; font-weight: 600;">Email:</td><td><a href="mailto:${customer.email || ''}" style="color: #2563eb;">${customer.email || 'Not provided'}</a></td></tr>
                  <tr><td style="padding: 4px 0; font-weight: 600;">Phone / Number:</td><td>${customer.phone || 'Not provided'}</td></tr>
                  <tr><td style="padding: 4px 0; font-weight: 600;">Preferred Channel:</td><td><span style="display:inline-block; padding:2px 8px; background:#e0f2fe; color:#0369a1; border-radius:4px; font-weight:600;">${channelLabel}</span></td></tr>
                  <tr><td style="padding: 4px 0; font-weight: 600;">Product Fulfillment:</td><td><span style="display:inline-block; padding:2px 8px; background:#f1f5f9; color:#334155; border-radius:4px; font-weight:600;">${productType === 'digital' ? '⚡ Digital Delivery' : '📦 Physical Delivery'}</span></td></tr>
                  <tr><td style="padding: 4px 0; font-weight: 600;">Payment System:</td><td><strong>${paymentLabel}</strong></td></tr>
                  <tr><td style="padding: 4px 0; font-weight: 600;">Delivery / Notes:</td><td>${customer.address || customer.notes || 'Not provided'}</td></tr>
                </table>

                ${quickLeadButtonsHtml}

                <h3 style="margin: 24px 0 12px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #475569;">Order Summary</h3>
                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; width: 100%;">
                  <thead>
                    <tr style="background: #f1f5f9; text-align: left;">
                      <th style="padding: 8px 12px; font-size: 12px; color: #475569;">Item</th>
                      <th style="padding: 8px 12px; font-size: 12px; color: #475569; text-align: center;">Qty</th>
                      <th style="padding: 8px 12px; font-size: 12px; color: #475569; text-align: right;">Price</th>
                      <th style="padding: 8px 12px; font-size: 12px; color: #475569; text-align: right;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colspan="3" style="padding: 14px 12px; font-size: 14px; font-weight: 700; text-align: right; color: #0f172a;">Total:</td>
                      <td style="padding: 14px 12px; font-size: 15px; font-weight: 700; text-align: right; color: #0f172a;">${formattedTotal}</td>
                    </tr>
                  </tfoot>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 16px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center;">
                Automated order dispatch powered by Email Commerce &bull; Qubtic
              </td>
            </tr>
          </table>
        </div>
      `,
    };

    // Dispatch merchant order email
    await transporter.sendMail(merchantMailOptions);

    // 2. Customer Receipt (if enabled and customer provided email)
    if (settings?.customerReceipt !== false && customer.email && customer.email.includes('@')) {
      try {
        const customerMailOptions = {
          from: formattedFrom,
          to: customer.email,
          subject: `Order Confirmation #${orderId} - ${businessName}`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a;">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden;">
                <tr>
                  <td style="padding: 24px; background: #0f172a; color: #ffffff;">
                    <h1 style="margin: 0; font-size: 20px; font-weight: 700;">${businessName}</h1>
                    <p style="margin: 4px 0 0; font-size: 13px; color: #94a3b8;">Order Confirmation #${orderId}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 24px;">
                    <p style="font-size: 15px; font-weight: 600; color: #16a34a; margin-top: 0;">
                      &#10003; Thank you for your order, ${customer.name || 'valued customer'}!
                    </p>
                    <p style="font-size: 14px; line-height: 1.6; color: #334155;">
                      Your order has been received by <strong>${businessName}</strong>. Our team is processing your request and will reach out to you via <strong>${channelLabel}</strong> (${customer.phone || customer.email}) regarding ${productType === 'digital' ? 'digital delivery / access' : 'shipping and delivery'}.
                    </p>

                    <table width="100%" style="font-size: 13px; color: #334155; margin: 16px 0; background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
                      <tr><td style="padding: 3px 0; font-weight: 600; width: 140px;">Order ID:</td><td><strong>#${orderId}</strong></td></tr>
                      <tr><td style="padding: 3px 0; font-weight: 600;">Payment System:</td><td>${paymentLabel}</td></tr>
                      <tr><td style="padding: 3px 0; font-weight: 600;">Product Type:</td><td>${productType === 'digital' ? '⚡ Digital Delivery' : '📦 Physical Delivery'}</td></tr>
                      <tr><td style="padding: 3px 0; font-weight: 600;">Contact Method:</td><td>${channelLabel}</td></tr>
                      <tr><td style="padding: 3px 0; font-weight: 600;">Delivery / Notes:</td><td>${customer.address || customer.notes || 'As agreed with seller'}</td></tr>
                    </table>

                    <h3 style="margin: 20px 0 12px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #475569;">Items Ordered</h3>
                    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; width: 100%;">
                      <thead>
                        <tr style="background: #f1f5f9; text-align: left;">
                          <th style="padding: 8px 12px; font-size: 12px; color: #475569;">Item</th>
                          <th style="padding: 8px 12px; font-size: 12px; color: #475569; text-align: center;">Qty</th>
                          <th style="padding: 8px 12px; font-size: 12px; color: #475569; text-align: right;">Price</th>
                          <th style="padding: 8px 12px; font-size: 12px; color: #475569; text-align: right;">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${itemsHtml}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colspan="3" style="padding: 14px 12px; font-size: 14px; font-weight: 700; text-align: right; color: #0f172a;">Total:</td>
                          <td style="padding: 14px 12px; font-size: 15px; font-weight: 700; text-align: right; color: #0f172a;">${formattedTotal}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center;">
                    If you have questions about your order, reply directly to this email or contact ${merchantEmail}.
                  </td>
                </tr>
              </table>
            </div>
          `,
        };
        await transporter.sendMail(customerMailOptions);
      } catch (receiptErr) {
        console.warn('Failed sending customer receipt:', receiptErr);
      }
    }

    return NextResponse.json(
      {
        success: true,
        orderId,
        message: 'Order placed successfully! A confirmation email has been dispatched to the seller and your inbox.',
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('Error handling order email dispatch:', error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Failed to dispatch order email automatically.',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

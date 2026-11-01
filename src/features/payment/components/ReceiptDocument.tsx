import { Document, Page, Text, View, StyleSheet, Image, Svg, Path } from '@react-pdf/renderer';
import { format } from 'date-fns';
import type { IPayment } from '../types/payment';

// Theme Colors
const COLOR_GREY_BG = '#334155'; // Slate grey replacing the dark #020617
const COLOR_PAGE_BG = '#f1f5f9';
const COLOR_WHITE = '#ffffff';
const COLOR_DARK = '#0f172a';
const COLOR_MUTED = '#64748b';
const COLOR_LIGHT = '#94a3b8';
const COLOR_SLATE_BORDER = '#e2e8f0';
const COLOR_ROW_BORDER = '#f1f5f9';
const COLOR_ORANGE = '#ea580c';
const COLOR_ORANGE_LIGHT = '#f97316';
const COLOR_ORANGE_BG = '#fff7ed';

const styles = StyleSheet.create({
  page: {
    fontSize: 9,
    fontFamily: 'Helvetica',
    backgroundColor: COLOR_PAGE_BG,
    padding: 32,
  },
  card: {
    backgroundColor: COLOR_WHITE,
    borderRadius: 16,
    overflow: 'hidden',
  },

  // Top Strip (Grey)
  topStrip: {
    backgroundColor: COLOR_GREY_BG,
    paddingHorizontal: 32,
    paddingTop: 28,
    paddingBottom: 28,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoImage: {
    width: 26,
    height: 26,
    objectFit: 'contain',
  },
  brandTextCol: {
    flexDirection: 'column',
  },
  brandName: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: COLOR_WHITE,
    letterSpacing: 1,
  },
  brandTagline: {
    fontSize: 7.5,
    fontFamily: 'Helvetica',
    color: '#cbd5e1',
    marginTop: 2,
  },
  badgeText: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: COLOR_ORANGE_LIGHT,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Status Section
  statusSection: {
    alignItems: 'center',
    paddingBottom: 4,
  },
  statusTitle: {
    fontSize: 17,
    fontFamily: 'Helvetica-Bold',
    color: COLOR_WHITE,
    marginTop: 10,
    marginBottom: 4,
    textAlign: 'center',
  },
  statusSub: {
    fontSize: 8.5,
    fontFamily: 'Helvetica',
    color: '#cbd5e1',
    textAlign: 'center',
    letterSpacing: 0.3,
  },

  // Perforated Row 1
  notchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notchCircleLeft: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLOR_PAGE_BG,
    marginLeft: -12,
  },
  dashedLine: {
    flex: 1,
    borderTopWidth: 1.5,
    borderTopColor: COLOR_SLATE_BORDER,
    borderStyle: 'dashed',
    marginHorizontal: 4,
  },
  notchCircleRight: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLOR_PAGE_BG,
    marginRight: -12,
  },

  // Amount Section
  amountSection: {
    backgroundColor: COLOR_WHITE,
    paddingHorizontal: 32,
    paddingTop: 26,
    paddingBottom: 14,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: COLOR_MUTED,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  amountValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  amountCurrency: {
    fontSize: 15,
    fontFamily: 'Helvetica-Bold',
    color: COLOR_ORANGE,
    marginRight: 6,
  },
  amountNumber: {
    fontSize: 34,
    fontFamily: 'Helvetica-Bold',
    color: COLOR_DARK,
    letterSpacing: -0.5,
  },

  // Details Section (2x2 Grid)
  detailsSection: {
    backgroundColor: COLOR_WHITE,
    paddingHorizontal: 32,
    paddingTop: 16,
    paddingBottom: 18,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailCell: {
    width: '50%',
    paddingVertical: 8,
    paddingRight: 12,
  },
  detailCellRight: {
    width: '50%',
    paddingVertical: 8,
    paddingLeft: 12,
  },
  detailLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: COLOR_LIGHT,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 3,
  },
  detailValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: COLOR_DARK,
  },
  detailValueAccent: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: COLOR_ORANGE,
  },
  detailSubValue: {
    fontSize: 8,
    fontFamily: 'Helvetica',
    color: COLOR_MUTED,
    marginTop: 2,
  },
  divider: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: COLOR_ROW_BORDER,
    marginVertical: 6,
  },

  // Notes Box
  noteSection: {
    backgroundColor: COLOR_WHITE,
    paddingHorizontal: 32,
    paddingBottom: 22,
  },
  noteBox: {
    backgroundColor: COLOR_ORANGE_BG,
    borderRadius: 10,
    padding: 14,
    borderLeftWidth: 3.5,
    borderLeftColor: COLOR_ORANGE,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    gap: 5,
  },
  noteDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLOR_ORANGE,
  },
  noteLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: COLOR_ORANGE,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  noteText: {
    fontSize: 8.5,
    fontFamily: 'Helvetica',
    color: COLOR_DARK,
    lineHeight: 1.5,
  },

  // Perforated Row 2
  notchRow2: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notchCircleLeft2: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLOR_PAGE_BG,
    marginLeft: -12,
  },
  dashedLine2: {
    flex: 1,
    borderTopWidth: 1.5,
    borderTopColor: COLOR_SLATE_BORDER,
    borderStyle: 'dashed',
    marginHorizontal: 4,
  },
  notchCircleRight2: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLOR_PAGE_BG,
    marginRight: -12,
  },

  // QR Section
  footerSection: {
    backgroundColor: COLOR_WHITE,
    paddingHorizontal: 32,
    paddingTop: 18,
    paddingBottom: 24,
  },
  qrBlock: {
    alignItems: 'flex-start',
  },
  qrImage: {
    width: 58,
    height: 58,
    borderRadius: 4,
  },
  qrLabel: {
    fontSize: 6.5,
    fontFamily: 'Helvetica',
    color: COLOR_LIGHT,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
    textAlign: 'center',
    width: 58,
  },

  // Footer Bar (Grey)
  footerBar: {
    backgroundColor: COLOR_GREY_BG,
    paddingVertical: 11,
    paddingHorizontal: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  footerBarText: {
    fontSize: 7.5,
    fontFamily: 'Helvetica',
    color: '#cbd5e1',
  },
  footerBarAccent: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: COLOR_ORANGE_LIGHT,
    letterSpacing: 0.5,
  },successIcon: {
    width: 40,
    height: 40,
    marginBottom: 12,
   },
});

const safeFormatDate = (dateStr: string, formatPattern: string) => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return format(d, formatPattern);
  } catch {
    return dateStr;
  }
};

const getAssetUrl = (path: string) => {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}${path}`;
  }
  return path;
};

export const ReceiptDocument = ({ payment }: { payment: IPayment }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.card}>
          {/* Top Header Strip (Grey Background) */}
          <View style={styles.topStrip}>
            {/* Header Brand & Badge */}
            <View style={styles.headerRow}>
              <View style={styles.brandRow}>
                <Image
                  src={getAssetUrl('/assets/logo.png')}
                  style={styles.logoImage}
                />
                <View style={styles.brandTextCol}>
                  <Text style={styles.brandName}>TRIVY.ID</Text>
                  <Text style={styles.brandTagline}>Web & Apps Development</Text>
                </View>
              </View>
              <Text style={styles.badgeText}>OFFICIAL RECEIPT</Text>
              
            </View>

            {/* Status Section */}
            <View style={styles.statusSection}>
              <Image
                  src="https://cdn-icons-png.flaticon.com/512/7518/7518748.png"
                  style={styles.successIcon}
              />
              <Text style={styles.statusTitle}>Payment Successful</Text>
              <Text style={styles.statusSub}>Transaction verified & confirmed</Text>
            </View>
          </View>

          {/* Notch Row 1 */}
          <View style={styles.notchRow}>
            <View style={styles.notchCircleLeft} />
            <View style={styles.dashedLine} />
            <View style={styles.notchCircleRight} />
          </View>

          {/* Amount Paid Section */}
          <View style={styles.amountSection}>
            <Text style={styles.amountLabel}>Total Amount Paid</Text>
            <View style={styles.amountValueRow}>
              <Text style={styles.amountCurrency}>IDR</Text>
              <Text style={styles.amountNumber}>
                {new Intl.NumberFormat('id-ID').format(payment.amount_paid || 0)}
              </Text>
            </View>
          </View>

          {/* Details Section (2x2 Grid) */}
          <View style={styles.detailsSection}>
            <View style={styles.detailsGrid}>
              {/* Payment Date */}
              <View style={styles.detailCell}>
                <Text style={styles.detailLabel}>Payment Date</Text>
                <Text style={styles.detailValue}>
                  {safeFormatDate(payment.payment_date, 'dd MMM yyyy')}
                </Text>
                <Text style={styles.detailSubValue}>
                  {safeFormatDate(payment.payment_date, 'EEEE')}
                </Text>
              </View>

              {/* Payment Method */}
              <View style={styles.detailCellRight}>
                <Text style={styles.detailLabel}>Payment Method</Text>
                <Text style={[styles.detailValue, { textTransform: 'uppercase' }]}>
                  {payment.method || 'TRANSFER BANK'}
                </Text>
              </View>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Reference Number */}
              <View style={styles.detailCell}>
                <Text style={styles.detailLabel}>Reference Number</Text>
                <Text style={styles.detailValue}>
                  {payment.reference_number || '—'}
                </Text>
              </View>

              {/* Related Invoice */}
              <View style={styles.detailCellRight}>
                <Text style={styles.detailLabel}>Related Invoice</Text>
                <Text style={styles.detailValueAccent}>
                  {payment.invoices?.invoice_number || 'Manual Entry'}
                </Text>
                {payment.invoices?.title && (
                  <Text style={styles.detailSubValue}>{payment.invoices.title}</Text>
                )}
              </View>
            </View>
          </View>

          {/* Notes Box */}
          {payment.note && (
            <View style={styles.noteSection}>
              <View style={styles.noteBox}>
                <View style={styles.noteHeader}>
                  <View style={styles.noteDot} />
                  <Text style={styles.noteLabel}>NOTES</Text>
                </View>
                <Text style={styles.noteText}>{payment.note}</Text>
              </View>
            </View>
          )}

          {/* Notch Row 2 */}
          <View style={styles.notchRow2}>
            <View style={styles.notchCircleLeft2} />
            <View style={styles.dashedLine2} />
            <View style={styles.notchCircleRight2} />
          </View>

          {/* QR Code Section */}
          <View style={styles.footerSection}>
            <View style={styles.qrBlock}>
              <Image
                src={getAssetUrl('/assets/qr-trivy.jpg')}
                style={styles.qrImage}
              />
              <Text style={styles.qrLabel}>SCAN TO VISIT US</Text>
            </View>
          </View>

          {/* Footer Bar (Grey Background) */}
          <View style={styles.footerBar}>
            <Text style={styles.footerBarText}>
              {`Reference Number: ${payment.reference_number || '—'}`}
            </Text>
            <Text style={styles.footerBarAccent}>trivy.id</Text>
            <Text style={styles.footerBarText}>
              {format(new Date(), 'dd MMM yyyy · HH:mm')}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

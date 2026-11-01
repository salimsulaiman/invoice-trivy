import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { id } from 'date-fns/locale/id';
import type { IInvoice, IInvoiceItem } from '../types/invoice';
import type { IBankAccount } from '@/features/bank-accounts/types/bank-account';

const COLOR_PRIMARY = '#1e293b';
const COLOR_SECONDARY = '#64748b';
const COLOR_MUTED = '#475569';
const COLOR_BORDER = '#94a3b8';
const COLOR_TABLE_HEADER = '#d1d5db';

const styles = StyleSheet.create({
  page: {
    fontSize: 9,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
    color: COLOR_PRIMARY,
    position: 'relative',
  },
  topPattern: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 215,
    height: 85,
  },
  bottomPattern: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 215,
    height: 85,
    transform: 'rotate(180deg)',
  },
  container: {
    paddingHorizontal: 40,
    paddingTop: 36,
    paddingBottom: 35,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  logoCol: {
    alignItems: 'flex-start',
  },
  logoImage: {
    width: 42,
    height: 32,
    objectFit: 'contain',
    marginBottom: 6,
  },
  logoTitle: {
    fontSize: 11.5,
    fontFamily: 'Helvetica-Bold',
    color: COLOR_PRIMARY,
    letterSpacing: 0.5,
  },
  logoSubtitle: {
    fontSize: 7.5,
    fontFamily: 'Helvetica',
    color: COLOR_SECONDARY,
    marginTop: 2,
  },
  invoiceTitle: {
    fontSize: 26,
    fontFamily: 'Helvetica-Bold',
    color: COLOR_PRIMARY,
    letterSpacing: 1.5,
    textAlign: 'right',
  },
  metaSection: {
    marginBottom: 22,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  metaGap: {
    marginTop: 8,
  },
  metaLabel: {
    width: 125,
    fontSize: 9.5,
    fontFamily: 'Helvetica',
    color: COLOR_PRIMARY,
  },
  metaValue: {
    flex: 1,
    fontSize: 9.5,
    fontFamily: 'Helvetica',
    color: COLOR_PRIMARY,
  },
  sectionHeading: {
    fontSize: 10.5,
    fontFamily: 'Helvetica-BoldOblique',
    color: COLOR_PRIMARY,
    marginBottom: 8,
  },
  table: {
    borderWidth: 1,
    borderColor: COLOR_BORDER,
    marginBottom: 22,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLOR_TABLE_HEADER,
    borderBottomWidth: 1,
    borderBottomColor: COLOR_BORDER,
  },
  tableHeaderText: {
    fontSize: 9.5,
    fontFamily: 'Helvetica',
    color: COLOR_PRIMARY,
  },
  colDescriptionHeader: {
    width: '68%',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRightWidth: 1,
    borderRightColor: COLOR_BORDER,
  },
  colAmountHeader: {
    width: '32%',
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableRowBorderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: COLOR_BORDER,
  },
  colDescriptionBody: {
    width: '68%',
    padding: 10,
    borderRightWidth: 1,
    borderRightColor: COLOR_BORDER,
  },
  colAmountBody: {
    width: '32%',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 9.5,
    fontFamily: 'Helvetica',
    color: COLOR_PRIMARY,
    marginBottom: 6,
  },
  itemDetailsWrapper: {
    paddingLeft: 12,
  },
  itemDetailLine: {
    fontSize: 8,
    fontFamily: 'Helvetica',
    color: COLOR_MUTED,
    marginBottom: 2,
    lineHeight: 1.3,
  },
  itemAmount: {
    fontSize: 9.5,
    fontFamily: 'Helvetica',
    color: COLOR_PRIMARY,
  },
  notesSection: {
    marginBottom: 16,
  },
  notesHeading: {
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: COLOR_PRIMARY,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 8.5,
    fontFamily: 'Helvetica',
    color: COLOR_MUTED,
    paddingLeft: 4,
  },
  thankYouSection: {
    marginBottom: 24,
  },
  thankYouText: {
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: COLOR_PRIMARY,
    marginBottom: 8,
  },
  companyName: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: COLOR_PRIMARY,
  },
  footerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qrCol: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrImage: {
    width: 75,
    height: 75,
  },
  paymentDataCol: {
    width: 210,
    justifyContent: 'center',
    marginLeft: -25,
  },
  paymentDataTitle: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: COLOR_PRIMARY,
    marginBottom: 8,
  },
  paymentDataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  paymentDataKey: {
    width: 68,
    fontSize: 8.5,
    fontFamily: 'Helvetica',
    color: COLOR_PRIMARY,
  },
  paymentDataColon: {
    width: 12,
    fontSize: 8.5,
    fontFamily: 'Helvetica',
    color: COLOR_PRIMARY,
    textAlign: 'center',
  },
  paymentDataValue: {
    flex: 1,
    fontSize: 8.5,
    fontFamily: 'Helvetica',
    color: COLOR_PRIMARY,
  },
  receivedByCol: {
    width: 130,
  },
  receivedByTitle: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: COLOR_PRIMARY,
    marginBottom: 4,
  },
  signatureBox: {
    alignItems: 'flex-start',
  },
  signatureImage: {
    width: 90,
    height: 35,
    objectFit: 'contain',
    marginBottom: -4,
  },
  signatureLine: {
    width: 125,
    borderBottomWidth: 1,
    borderBottomColor: COLOR_PRIMARY,
    marginTop: 4,
    marginBottom: 4,
  },
  signerName: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: COLOR_PRIMARY,
  },
  signerRole: {
    fontSize: 8,
    fontFamily: 'Helvetica',
    color: COLOR_MUTED,
    marginTop: 1,
  },
});

const formatCurrency = (amount: number) => {
  const formatted = new Intl.NumberFormat('id-ID').format(amount || 0);
  return `Rp ${formatted}`;
};

const formatDateIndonesian = (dateStr?: string | null) => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return format(d, 'dd MMMM yyyy', { locale: id });
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

const formatNoteText = (notes?: string | null) => {
  if (!notes || !notes.trim()) {
    return '- Invoice ini merupakan tagihan layanan SEO selama 3 bulan kedepan';
  }
  const clean = notes.trim();
  if (clean.startsWith('-')) {
    return clean;
  }
  return `- ${clean}`;
};

const renderItemDescription = (item: IInvoiceItem, invoiceTitle?: string | null) => {
  const desc = item.description?.trim() || '';
  const lines = desc.split('\n').map((l) => l.trim()).filter(Boolean);

  const showInvoiceTitle = invoiceTitle && !desc.toLowerCase().includes(invoiceTitle.toLowerCase());

  if (showInvoiceTitle) {
    return (
      <View>
        <Text style={styles.itemTitle}>{invoiceTitle}</Text>
        <View style={styles.itemDetailsWrapper}>
          {lines.map((line, idx) => (
            <Text key={idx} style={styles.itemDetailLine}>
              {line}
            </Text>
          ))}
        </View>
      </View>
    );
  }

  if (lines.length > 1) {
    return (
      <View>
        <Text style={styles.itemTitle}>{lines[0]}</Text>
        <View style={styles.itemDetailsWrapper}>
          {lines.slice(1).map((line, idx) => (
            <Text key={idx} style={styles.itemDetailLine}>
              {line}
            </Text>
          ))}
        </View>
      </View>
    );
  }

  return <Text style={styles.itemTitle}>{desc || invoiceTitle || '-'}</Text>;
};

export const InvoiceDocument = ({ 
  invoice, 
  signatureUrl, 
  payments = [],
  bankAccount = null,
}: { 
  invoice: IInvoice; 
  signatureUrl?: string | null; 
  payments?: any[];
  bankAccount?: IBankAccount | null;
}) => {
  const rawItems = invoice.invoice_items && invoice.invoice_items.length > 0
    ? invoice.invoice_items
    : (invoice.items && invoice.items.length > 0 ? invoice.items : []);

  const displayItems: IInvoiceItem[] = rawItems.length > 0
    ? rawItems
    : [
        {
          id: 'default',
          description: invoice.title || 'Pembayaran layanan',
          quantity: 1,
          price: Number(invoice.total || 0),
          total: Number(invoice.total || 0),
        },
      ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Background Corner Geometric Patterns */}
        <Image
          src={getAssetUrl('/assets/abstract-geometric.png')}
          style={styles.topPattern}
        />
        <Image
          src={getAssetUrl('/assets/abstract-geometric.png')}
          style={styles.bottomPattern}
        />

        <View style={styles.container}>
          {/* Header Row */}
          <View style={styles.header}>
            <View style={styles.logoCol}>
              <Image
                src={getAssetUrl('/assets/logo.png')}
                style={styles.logoImage}
              />
              <Text style={styles.logoTitle}>TRIVY.ID</Text>
              <Text style={styles.logoSubtitle}>Web & Apps Development</Text>
            </View>

            <Text style={styles.invoiceTitle}>INVOICE</Text>
          </View>

          {/* Meta Information Section */}
          <View style={styles.metaSection}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Nomor Invoice:</Text>
              <Text style={styles.metaValue}>{invoice.invoice_number}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Tanggal:</Text>
              <Text style={styles.metaValue}>{formatDateIndonesian(invoice.issue_date)}</Text>
            </View>

            <View style={[styles.metaRow, styles.metaGap]}>
              <Text style={styles.metaLabel}>Dari:</Text>
              <Text style={styles.metaValue}>Trivy Infinity Solutions</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Website:</Text>
              <Text style={styles.metaValue}>https://www.trivy.id/</Text>
            </View>

            <View style={[styles.metaRow, styles.metaGap]}>
              <Text style={styles.metaLabel}>Ditujukan Kepada:</Text>
              <Text style={styles.metaValue}>{invoice.customers?.name || '-'}</Text>
            </View>
          </View>

          {/* Section Heading */}
          <Text style={styles.sectionHeading}>Pembayaran</Text>

          {/* Table */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <View style={styles.colDescriptionHeader}>
                <Text style={styles.tableHeaderText}>Deskripsi</Text>
              </View>
              <View style={styles.colAmountHeader}>
                <Text style={styles.tableHeaderText}>Jumlah</Text>
              </View>
            </View>

            {displayItems.map((item, index) => {
              const isLast = index === displayItems.length - 1;
              return (
                <View
                  key={item.id || index}
                  style={[
                    styles.tableRow,
                    !isLast ? styles.tableRowBorderBottom : {},
                  ]}
                >
                  <View style={styles.colDescriptionBody}>
                    {renderItemDescription(item, invoice.title)}
                  </View>
                  <View style={styles.colAmountBody}>
                    <Text style={styles.itemAmount}>
                      {formatCurrency(item.total ?? (item.price * (item.quantity || 1)))}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Notes Section */}
          <View style={styles.notesSection}>
            <Text style={styles.notesHeading}>Catatan :</Text>
            <Text style={styles.notesText}>{formatNoteText(invoice.notes)}</Text>
          </View>

          {/* Thank You Section */}
          <View style={styles.thankYouSection}>
            <Text style={styles.thankYouText}>
              Terima kasih atas kepercayaan Anda menggunakan layanan kami.
            </Text>
            <Text style={styles.companyName}>Trivy Infinity Solutions</Text>
          </View>

          {/* Footer Section */}
          <View style={styles.footerSection}>
            {/* QR Code */}
            <View style={styles.qrCol}>
              <Image
                src={getAssetUrl('/assets/qr-trivy.jpg')}
                style={styles.qrImage}
              />
            </View>

            {/* Payment Data */}
            <View style={styles.paymentDataCol}>
              <Text style={styles.paymentDataTitle}>PAYMENT DATA:</Text>
              <View style={styles.paymentDataRow}>
                <Text style={styles.paymentDataKey}>Bank Name</Text>
                <Text style={styles.paymentDataColon}>:</Text>
                <Text style={styles.paymentDataValue}>{bankAccount?.bank_name || 'SeaBank'}</Text>
              </View>
              <View style={styles.paymentDataRow}>
                <Text style={styles.paymentDataKey}>Account No</Text>
                <Text style={styles.paymentDataColon}>:</Text>
                <Text style={styles.paymentDataValue}>{bankAccount?.account_number || '901395496828'}</Text>
              </View>
              <View style={styles.paymentDataRow}>
                <Text style={styles.paymentDataKey}>A/N</Text>
                <Text style={styles.paymentDataColon}>:</Text>
                <Text style={styles.paymentDataValue}>{bankAccount?.account_holder || 'Leli Nurfitriani'}</Text>
              </View>
            </View>

            {/* Received By */}
            <View style={styles.receivedByCol}>
              <Text style={styles.receivedByTitle}>Received By:</Text>
              <View style={styles.signatureBox}>
                {signatureUrl ? (
                  <Image src={signatureUrl} style={styles.signatureImage} />
                ) : (
                  <View style={{ height: 35 }} />
                )}
                <View style={styles.signatureLine} />
                <Text style={styles.signerName}>{invoice.user?.name || 'Rofiyatul Septiyani'}</Text>
                <Text style={styles.signerRole}>Person in Charge</Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};


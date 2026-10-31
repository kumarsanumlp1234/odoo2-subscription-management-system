package com.brightloop.subscription.service;

import com.brightloop.subscription.entity.Invoice;
import com.brightloop.subscription.entity.InvoiceLine;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

@Service
public class PdfService {

    private static final Logger logger = LoggerFactory.getLogger(PdfService.class);

    public byte[] generateInvoicePdf(Invoice invoice) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);
            document.setMargins(36, 36, 36, 36);

            // Brand Header
            Paragraph brandTitle = new Paragraph("BRIGHTLOOP SOFTWARE")
                    .setFontSize(22)
                    .setBold()
                    .setFontColor(new DeviceRgb(59, 130, 246));
            Paragraph brandSubtitle = new Paragraph("Recurring Subscription & Billing Engine\nOuter Ring Road, Bengaluru, Karnataka, India\nsupport@brightloop.io | +91 9876543210")
                    .setFontSize(9)
                    .setFontColor(ColorConstants.GRAY);

            document.add(brandTitle);
            document.add(brandSubtitle);
            document.add(new Paragraph("\n"));

            // Invoice Title & Metadata Table
            Table metaTable = new Table(UnitValue.createPercentArray(new float[]{50, 50})).useAllAvailableWidth();

            Cell invoiceToCell = new Cell().setBorder(null);
            invoiceToCell.add(new Paragraph("INVOICE TO:").setBold().setFontSize(10));
            invoiceToCell.add(new Paragraph(invoice.getCustomer().getFullName()).setFontSize(11).setBold());
            invoiceToCell.add(new Paragraph(invoice.getCustomer().getEmail()).setFontSize(9));
            if (invoice.getCustomer().getCustomerProfile() != null) {
                invoiceToCell.add(new Paragraph(invoice.getCustomer().getCustomerProfile().getCompanyName() != null ? invoice.getCustomer().getCustomerProfile().getCompanyName() : "").setFontSize(9));
                invoiceToCell.add(new Paragraph("GST: " + (invoice.getCustomer().getCustomerProfile().getGstNumber() != null ? invoice.getCustomer().getCustomerProfile().getGstNumber() : "N/A")).setFontSize(9));
            }

            Cell detailsCell = new Cell().setBorder(null).setTextAlignment(TextAlignment.RIGHT);
            detailsCell.add(new Paragraph("INVOICE #" + invoice.getInvoiceNumber()).setBold().setFontSize(13));
            detailsCell.add(new Paragraph("Status: " + invoice.getStatus().name()).setFontSize(10).setBold().setFontColor(invoice.getStatus().name().equals("PAID") ? ColorConstants.DARK_GRAY : ColorConstants.RED));
            detailsCell.add(new Paragraph("Issue Date: " + invoice.getIssueDate()).setFontSize(9));
            detailsCell.add(new Paragraph("Due Date: " + invoice.getDueDate()).setFontSize(9));
            detailsCell.add(new Paragraph("Billing Period: " + invoice.getBillingPeriodStart() + " to " + invoice.getBillingPeriodEnd()).setFontSize(9));

            metaTable.addCell(invoiceToCell);
            metaTable.addCell(detailsCell);
            document.add(metaTable);
            document.add(new Paragraph("\n"));

            // Items Table
            Table table = new Table(UnitValue.createPercentArray(new float[]{40, 15, 15, 15, 15})).useAllAvailableWidth();
            table.addHeaderCell(new Cell().add(new Paragraph("Item Description").setBold()).setBackgroundColor(new DeviceRgb(243, 244, 246)));
            table.addHeaderCell(new Cell().add(new Paragraph("Qty").setBold()).setTextAlignment(TextAlignment.CENTER).setBackgroundColor(new DeviceRgb(243, 244, 246)));
            table.addHeaderCell(new Cell().add(new Paragraph("Unit Price").setBold()).setTextAlignment(TextAlignment.RIGHT).setBackgroundColor(new DeviceRgb(243, 244, 246)));
            table.addHeaderCell(new Cell().add(new Paragraph("Tax").setBold()).setTextAlignment(TextAlignment.RIGHT).setBackgroundColor(new DeviceRgb(243, 244, 246)));
            table.addHeaderCell(new Cell().add(new Paragraph("Line Total").setBold()).setTextAlignment(TextAlignment.RIGHT).setBackgroundColor(new DeviceRgb(243, 244, 246)));

            for (InvoiceLine line : invoice.getLines()) {
                String desc = line.getProductName() + (line.getVariantName() != null ? " (" + line.getVariantName() + ")" : "");
                table.addCell(new Cell().add(new Paragraph(desc).setFontSize(9)));
                table.addCell(new Cell().add(new Paragraph(String.valueOf(line.getQuantity())).setFontSize(9)).setTextAlignment(TextAlignment.CENTER));
                table.addCell(new Cell().add(new Paragraph("₹" + line.getUnitPrice()).setFontSize(9)).setTextAlignment(TextAlignment.RIGHT));
                table.addCell(new Cell().add(new Paragraph("₹" + line.getTaxAmount() + " (" + line.getTaxRate() + "%)").setFontSize(9)).setTextAlignment(TextAlignment.RIGHT));
                table.addCell(new Cell().add(new Paragraph("₹" + line.getLineTotal()).setFontSize(9)).setTextAlignment(TextAlignment.RIGHT));
            }
            document.add(table);
            document.add(new Paragraph("\n"));

            // Totals Table
            Table totalsTable = new Table(UnitValue.createPercentArray(new float[]{60, 40})).useAllAvailableWidth();
            totalsTable.addCell(new Cell().setBorder(null).add(new Paragraph("Thank you for choosing Brightloop Software.\nPayments can be completed via Net Banking, UPI, or Credit Card.").setFontSize(8).setFontColor(ColorConstants.GRAY)));

            Cell totalsCell = new Cell().setBorder(null).setTextAlignment(TextAlignment.RIGHT);
            totalsCell.add(new Paragraph("Subtotal: ₹" + invoice.getSubtotal()).setFontSize(9));
            totalsCell.add(new Paragraph("Discount: -₹" + invoice.getDiscountAmount()).setFontSize(9));
            totalsCell.add(new Paragraph("Taxes: +₹" + invoice.getTaxAmount()).setFontSize(9));
            totalsCell.add(new Paragraph("Total Amount: ₹" + invoice.getTotalAmount()).setBold().setFontSize(12));
            totalsCell.add(new Paragraph("Paid Amount: ₹" + invoice.getPaidAmount()).setFontSize(9));
            totalsCell.add(new Paragraph("Balance Due: ₹" + invoice.getBalanceDue()).setBold().setFontSize(11).setFontColor(invoice.getBalanceDue().compareTo(java.math.BigDecimal.ZERO) == 0 ? ColorConstants.DARK_GRAY : ColorConstants.RED));
            totalsTable.addCell(totalsCell);

            document.add(totalsTable);

            document.close();
            return baos.toByteArray();
        } catch (Exception ex) {
            logger.error("Error generating invoice PDF", ex);
            throw new RuntimeException("Could not generate invoice PDF: " + ex.getMessage());
        }
    }
}


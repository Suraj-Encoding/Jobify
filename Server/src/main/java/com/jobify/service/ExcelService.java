package com.jobify.service;

import com.jobify.model.Application;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.common.usermodel.HyperlinkType;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Excel Service - Export data to Excel format
 */
@Slf4j
@Service
public class ExcelService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    /**
     * Export applications to Excel
     */
    public byte[] exportApplicationsToExcel(List<Application> applications, String jobTitle, String serverBaseUrl) throws IOException {
        log.info("Exporting {} applications to Excel for job: {}", applications.size(), jobTitle);

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Candidates");

            // ===== CREATE STYLES =====
            
            // Title style (for job title header)
            CellStyle titleStyle = workbook.createCellStyle();
            Font titleFont = workbook.createFont();
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short) 16);
            titleFont.setColor(IndexedColors.WHITE.getIndex());
            titleStyle.setFont(titleFont);
            titleStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            titleStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            titleStyle.setAlignment(HorizontalAlignment.CENTER);
            titleStyle.setVerticalAlignment(VerticalAlignment.CENTER);

            // Header style
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setFontHeightInPoints((short) 11);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.ROYAL_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setBorderTop(BorderStyle.THIN);
            headerStyle.setBorderLeft(BorderStyle.THIN);
            headerStyle.setBorderRight(BorderStyle.THIN);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            headerStyle.setVerticalAlignment(VerticalAlignment.CENTER);

            // Data style (white rows)
            CellStyle dataStyle = workbook.createCellStyle();
            dataStyle.setBorderBottom(BorderStyle.THIN);
            dataStyle.setBorderTop(BorderStyle.THIN);
            dataStyle.setBorderLeft(BorderStyle.THIN);
            dataStyle.setBorderRight(BorderStyle.THIN);
            dataStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            dataStyle.setWrapText(true);

            // Alternating row style (light gray)
            CellStyle altDataStyle = workbook.createCellStyle();
            altDataStyle.cloneStyleFrom(dataStyle);
            altDataStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            altDataStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // Status styles
            CellStyle pendingStyle = createStatusStyle(workbook, IndexedColors.LIGHT_YELLOW.getIndex());
            CellStyle reviewedStyle = createStatusStyle(workbook, IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex());
            CellStyle acceptedStyle = createStatusStyle(workbook, IndexedColors.LIGHT_GREEN.getIndex());
            CellStyle rejectedStyle = createStatusStyle(workbook, IndexedColors.CORAL.getIndex());

            // Link style
            CellStyle linkStyle = workbook.createCellStyle();
            linkStyle.cloneStyleFrom(dataStyle);
            Font linkFont = workbook.createFont();
            linkFont.setColor(IndexedColors.BLUE.getIndex());
            linkFont.setUnderline(Font.U_SINGLE);
            linkStyle.setFont(linkFont);

            // ===== CREATE TITLE ROW =====
            Row titleRow = sheet.createRow(0);
            titleRow.setHeightInPoints(35);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("Candidates for: " + jobTitle);
            titleCell.setCellStyle(titleStyle);
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 7));

            // ===== CREATE HEADER ROW =====
            Row headerRow = sheet.createRow(1);
            headerRow.setHeightInPoints(25);
            String[] headers = {
                "#", "Candidate Name", "Email", "Status", "Cover Letter", 
                "Resume", "Applied Date", "Rejection Reason"
            };

            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // ===== CREATE DATA ROWS =====
            int rowNum = 2;
            for (Application app : applications) {
                Row row = sheet.createRow(rowNum);
                row.setHeightInPoints(30);
                boolean isAltRow = (rowNum % 2 == 0);
                CellStyle currentStyle = isAltRow ? altDataStyle : dataStyle;

                // S.No
                Cell cell0 = row.createCell(0);
                cell0.setCellValue(rowNum - 1);
                cell0.setCellStyle(currentStyle);

                // Candidate Name
                Cell cell1 = row.createCell(1);
                String candidateName = app.getCandidateName() != null ? app.getCandidateName() : 
                    (app.getCandidate() != null ? 
                        (app.getCandidate().getFirstName() + " " + app.getCandidate().getLastName()) : "N/A");
                cell1.setCellValue(candidateName);
                cell1.setCellStyle(currentStyle);

                // Email
                Cell cell2 = row.createCell(2);
                String email = app.getCandidateEmail() != null ? app.getCandidateEmail() : 
                    (app.getCandidate() != null ? app.getCandidate().getEmail() : "N/A");
                cell2.setCellValue(email);
                cell2.setCellStyle(currentStyle);

                // Status with color
                Cell cell3 = row.createCell(3);
                cell3.setCellValue(formatStatus(app.getStatus()));
                cell3.setCellStyle(getStatusStyle(app.getStatus(), pendingStyle, reviewedStyle, acceptedStyle, rejectedStyle, currentStyle));

                // Cover Letter (as hyperlink)
                Cell cell4 = row.createCell(4);
                if (app.getCoverLetterUrl() != null && !app.getCoverLetterUrl().isEmpty()) {
                    String coverLetterLink = serverBaseUrl + "/api/v1/file/cover-letter/" + app.getCoverLetterUrl() + "/view";
                    cell4.setCellValue("View Cover Letter");
                    Hyperlink clHyperlink = workbook.getCreationHelper().createHyperlink(HyperlinkType.URL);
                    clHyperlink.setAddress(coverLetterLink);
                    cell4.setHyperlink(clHyperlink);
                    cell4.setCellStyle(linkStyle);
                } else {
                    cell4.setCellValue("No cover letter");
                    cell4.setCellStyle(currentStyle);
                }

                // Resume Link (as hyperlink)
                Cell cell5 = row.createCell(5);
                if (app.getResumeUrl() != null && !app.getResumeUrl().isEmpty()) {
                    String resumeLink = serverBaseUrl + "/api/v1/file/resume/" + app.getResumeUrl() + "/view";
                    cell5.setCellValue("View Resume");
                    Hyperlink hyperlink = workbook.getCreationHelper().createHyperlink(HyperlinkType.URL);
                    hyperlink.setAddress(resumeLink);
                    cell5.setHyperlink(hyperlink);
                    cell5.setCellStyle(linkStyle);
                } else {
                    cell5.setCellValue("No resume");
                    cell5.setCellStyle(currentStyle);
                }

                // Applied At
                Cell cell6 = row.createCell(6);
                cell6.setCellValue(app.getCreatedAt() != null ? app.getCreatedAt().format(DATE_FORMATTER) : "-");
                cell6.setCellStyle(currentStyle);

                // Rejection Reason
                Cell cell7 = row.createCell(7);
                cell7.setCellValue(app.getRejectionReason() != null ? app.getRejectionReason() : "-");
                cell7.setCellStyle(currentStyle);

                rowNum++;
            }

            // ===== SET COLUMN WIDTHS =====
            sheet.setColumnWidth(0, 2000);   // #
            sheet.setColumnWidth(1, 6000);   // Name
            sheet.setColumnWidth(2, 8000);   // Email
            sheet.setColumnWidth(3, 4000);   // Status
            sheet.setColumnWidth(4, 10000);  // Cover Letter
            sheet.setColumnWidth(5, 4000);   // Resume
            sheet.setColumnWidth(6, 6000);   // Applied Date
            sheet.setColumnWidth(7, 8000);   // Rejection Reason

            // Freeze header rows
            sheet.createFreezePane(0, 2);

            // Write to byte array
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }

    private CellStyle createStatusStyle(Workbook workbook, short colorIndex) {
        CellStyle style = workbook.createCellStyle();
        style.setFillForegroundColor(colorIndex);
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        return style;
    }

    private CellStyle getStatusStyle(String status, CellStyle pending, CellStyle reviewed, 
                                      CellStyle accepted, CellStyle rejected, CellStyle defaultStyle) {
        if (status == null) return defaultStyle;
        switch (status.toUpperCase()) {
            case "PENDING": return pending;
            case "UNDER_REVIEW": return reviewed;
            case "ACCEPTED": return accepted;
            case "REJECTED": return rejected;
            default: return defaultStyle;
        }
    }

    private String formatStatus(String status) {
        if (status == null) return "Unknown";
        switch (status.toUpperCase()) {
            case "PENDING": return "⏳ Pending";
            case "UNDER_REVIEW": return "👁 Under Review";
            case "ACCEPTED": return "✓ Accepted";
            case "REJECTED": return "✗ Rejected";
            default: return status;
        }
    }
}

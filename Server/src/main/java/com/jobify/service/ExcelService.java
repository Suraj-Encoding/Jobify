package com.jobify.service;

import com.jobify.model.Application;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
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

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    /**
     * Export applications to Excel
     */
    public byte[] exportApplicationsToExcel(List<Application> applications, String jobTitle, String serverBaseUrl) throws IOException {
        log.info("Exporting {} applications to Excel for job: {}", applications.size(), jobTitle);

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Candidates");

            // Create header style
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setFontHeightInPoints((short) 12);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setBorderTop(BorderStyle.THIN);
            headerStyle.setBorderLeft(BorderStyle.THIN);
            headerStyle.setBorderRight(BorderStyle.THIN);

            // Create data style
            CellStyle dataStyle = workbook.createCellStyle();
            dataStyle.setBorderBottom(BorderStyle.THIN);
            dataStyle.setBorderTop(BorderStyle.THIN);
            dataStyle.setBorderLeft(BorderStyle.THIN);
            dataStyle.setBorderRight(BorderStyle.THIN);

            // Create header row
            Row headerRow = sheet.createRow(0);
            String[] headers = {
                "S.No", "Candidate Name", "Email", "Status", "Cover Letter", 
                "Resume Link", "Applied At", "Rejection Reason"
            };

            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Create data rows
            int rowNum = 1;
            for (Application app : applications) {
                Row row = sheet.createRow(rowNum);

                // S.No
                Cell cell0 = row.createCell(0);
                cell0.setCellValue(rowNum);
                cell0.setCellStyle(dataStyle);

                // Candidate Name
                Cell cell1 = row.createCell(1);
                cell1.setCellValue(app.getCandidateName() != null ? app.getCandidateName() : 
                    (app.getCandidate() != null ? 
                        (app.getCandidate().getFirstName() + " " + app.getCandidate().getLastName()) : "N/A"));
                cell1.setCellStyle(dataStyle);

                // Email
                Cell cell2 = row.createCell(2);
                cell2.setCellValue(app.getCandidateEmail() != null ? app.getCandidateEmail() : 
                    (app.getCandidate() != null ? app.getCandidate().getEmail() : "N/A"));
                cell2.setCellStyle(dataStyle);

                // Status
                Cell cell3 = row.createCell(3);
                cell3.setCellValue(app.getStatus());
                cell3.setCellStyle(dataStyle);

                // Cover Letter
                Cell cell4 = row.createCell(4);
                cell4.setCellValue(app.getCoverLetter() != null ? app.getCoverLetter() : "");
                cell4.setCellStyle(dataStyle);

                // Resume Link
                Cell cell5 = row.createCell(5);
                if (app.getResumeUrl() != null && !app.getResumeUrl().isEmpty()) {
                    cell5.setCellValue(serverBaseUrl + "/api/v1/file/resume/" + app.getResumeUrl() + "/view");
                } else {
                    cell5.setCellValue("No resume");
                }
                cell5.setCellStyle(dataStyle);

                // Applied At
                Cell cell6 = row.createCell(6);
                cell6.setCellValue(app.getCreatedAt() != null ? app.getCreatedAt().format(DATE_FORMATTER) : "");
                cell6.setCellStyle(dataStyle);

                // Rejection Reason
                Cell cell7 = row.createCell(7);
                cell7.setCellValue(app.getRejectionReason() != null ? app.getRejectionReason() : "");
                cell7.setCellStyle(dataStyle);

                rowNum++;
            }

            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
                // Set minimum width
                if (sheet.getColumnWidth(i) < 3000) {
                    sheet.setColumnWidth(i, 3000);
                }
                // Set maximum width
                if (sheet.getColumnWidth(i) > 15000) {
                    sheet.setColumnWidth(i, 15000);
                }
            }

            // Write to byte array
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }
}

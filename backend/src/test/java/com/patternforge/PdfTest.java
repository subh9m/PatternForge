package com.patternforge;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.junit.jupiter.api.Test;
import java.io.File;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class PdfTest {

    @Test
    public void testPdfParsing() throws Exception {
        String pdfPath = "C:\\Users\\rajsh\\Downloads\\Striver_A2Z_Master_DSA_Database.pdf";
        File file = new File(pdfPath);
        if (!file.exists()) {
            pdfPath = "C:\\Users\\rajsh\\Downloads\\Striver_A2Z_Master_DSA_Database (1).pdf";
            file = new File(pdfPath);
        }
        
        System.out.println("Using PDF path: " + file.getAbsolutePath());
        
        try (PDDocument document = PDDocument.load(file)) {
            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setStartPage(3);
            stripper.setEndPage(26);
            String text = stripper.getText(document);
            String[] lines = text.split("\\r?\\n");
            
            System.out.println("Total lines read: " + lines.length);
            
            Pattern rowPattern = Pattern.compile("^\\s*(\\d+)\\s+(\\d+)\\s+(\\d+)\\s+(.*)$");
            int matchesCount = 0;
            
            for (int i = 0; i < Math.min(lines.length, 100); i++) {
                String line = lines[i].trim();
                Matcher m = rowPattern.matcher(line);
                if (m.matches()) {
                    matchesCount++;
                    System.out.println("MATCH line " + i + ": Master=" + m.group(1) + ", Topic=" + m.group(2) + ", LeetCode=" + m.group(3) + ", Name=" + m.group(4));
                } else {
                    if (line.length() > 0) {
                        System.out.println("NO MATCH line " + i + ": '" + line + "'");
                    }
                }
            }
            System.out.println("Matches in first 100 lines: " + matchesCount);
        }
    }
}

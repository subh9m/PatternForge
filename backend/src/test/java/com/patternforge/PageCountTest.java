package com.patternforge;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.junit.jupiter.api.Test;
import java.io.File;

public class PageCountTest {

    @Test
    public void printPageMetadata() throws Exception {
        String pdfPath = "C:\\Users\\rajsh\\.gemini\\antigravity-ide\\brain\\516239a5-06ae-4f40-af9d-c6edfc9baf50\\media__1783224148669.pdf";
        File file = new File(pdfPath);
        
        try (PDDocument document = PDDocument.load(file)) {
            int pages = document.getNumberOfPages();
            System.out.println(">>> TOTAL PAGES IN PDF: " + pages);
            
            PDFTextStripper stripper = new PDFTextStripper();
            for (int i = 1; i <= pages; i++) {
                stripper.setStartPage(i);
                stripper.setEndPage(i);
                String text = stripper.getText(document);
                String firstLine = "";
                String[] lines = text.split("\\r?\\n");
                for (String line : lines) {
                    if (line.trim().length() > 0) {
                        firstLine = line.trim();
                        break;
                    }
                }
                System.out.println("Page " + i + ": total lines = " + lines.length + ", first line = '" + firstLine + "'");
            }
        }
    }
}

package com.patternforge;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.junit.jupiter.api.Test;
import java.io.File;

public class PrintRawPage8 {

    @Test
    public void printPage8() throws Exception {
        String pdfPath = "C:\\Users\\rajsh\\.gemini\\antigravity-ide\\brain\\516239a5-06ae-4f40-af9d-c6edfc9baf50\\media__1783224148669.pdf";
        File file = new File(pdfPath);
        
        try (PDDocument document = PDDocument.load(file)) {
            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setStartPage(8);
            stripper.setEndPage(8);
            String text = stripper.getText(document);
            String[] lines = text.split("\\r?\\n");
            System.out.println("--- PAGE 8 RAW TEXT START ---");
            for (int i = 0; i < lines.length; i++) {
                System.out.println(String.format("Line %2d: '%s'", i, lines[i]));
            }
            System.out.println("--- PAGE 8 RAW TEXT END ---");
        }
    }
}

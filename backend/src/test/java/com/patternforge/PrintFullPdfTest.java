package com.patternforge;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.junit.jupiter.api.Test;
import java.io.File;

public class PrintFullPdfTest {

    @Test
    public void printPages() throws Exception {
        String pdfPath = "C:\\Users\\rajsh\\Downloads\\Striver_A2Z_Master_DSA_Database.pdf";
        File file = new File(pdfPath);
        if (!file.exists()) {
            pdfPath = "C:\\Users\\rajsh\\Downloads\\Striver_A2Z_Master_DSA_Database (1).pdf";
            file = new File(pdfPath);
        }
        
        try (PDDocument document = PDDocument.load(file)) {
            PDFTextStripper stripper = new PDFTextStripper();
            // Let's print Page 3 (Basics)
            stripper.setStartPage(3);
            stripper.setEndPage(3);
            String page3Text = stripper.getText(document);
            System.out.println("--- PAGE 3 TEXT START ---");
            System.out.println(page3Text);
            System.out.println("--- PAGE 3 TEXT END ---");
            
            // Let's print Page 5 (Sorting Techniques)
            stripper.setStartPage(5);
            stripper.setEndPage(5);
            String page5Text = stripper.getText(document);
            System.out.println("--- PAGE 5 TEXT START ---");
            System.out.println(page5Text);
            System.out.println("--- PAGE 5 TEXT END ---");
        }
    }
}

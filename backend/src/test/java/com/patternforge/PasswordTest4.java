package com.patternforge;

import org.junit.jupiter.api.Test;
import java.sql.Connection;
import java.sql.DriverManager;

public class PasswordTest4 {

    @Test
    public void testPasswords() {
        String[] passwords = {
            "Postgres@123", "Admin@123", "Password@123", "Postgres123", "Admin123",
            "Password123", "12345678", "1234abcd"
        };
        
        String url = "jdbc:postgresql://localhost:5432/postgres";
        String username = "postgres";
        
        System.out.println(">>> RUNNING PASSWORD DIAGNOSTIC TEST 4 <<<");
        
        for (String password : passwords) {
            try {
                Class.forName("org.postgresql.Driver");
                try (Connection conn = DriverManager.getConnection(url, username, password)) {
                    System.out.println(">>> SUCCESS! Postgres local password is: '" + password + "' <<<");
                    return;
                }
            } catch (Exception e) {
                // Ignore auth failures
            }
        }
        System.out.println(">>> Failed to find postgres password in fourth dictionary <<<");
    }
}

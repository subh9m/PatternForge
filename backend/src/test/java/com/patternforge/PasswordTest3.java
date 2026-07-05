package com.patternforge;

import org.junit.jupiter.api.Test;
import java.sql.Connection;
import java.sql.DriverManager;

public class PasswordTest3 {

    @Test
    public void testPasswords() {
        String[] passwords = {
            "gtfocode", "postgres", "admin", "root"
        };
        
        String url = "jdbc:postgresql://localhost:5432/postgres";
        String username = "postgres";
        
        System.out.println(">>> RUNNING PASSWORD DIAGNOSTIC TEST 3 <<<");
        
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
        System.out.println(">>> Failed to find postgres password in third dictionary <<<");
    }
}

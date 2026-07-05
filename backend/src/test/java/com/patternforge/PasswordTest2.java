package com.patternforge;

import org.junit.jupiter.api.Test;
import java.sql.Connection;
import java.sql.DriverManager;

public class PasswordTest2 {

    @Test
    public void testPasswords() {
        String[] passwords = {
            "admin123", "admin1234", "password123", "postgres123", "postgres1234",
            "12345", "12345678", "123456789", "db_password", "dbpassword",
            "local", "localhost", "development", "dev", "mypassword", "secret",
            "supersecret", "pass", "verfalarm", "alerta", "pingspace", "examplatform"
        };
        
        String url = "jdbc:postgresql://localhost:5432/postgres";
        String username = "postgres";
        
        System.out.println(">>> RUNNING PASSWORD DIAGNOSTIC TEST 2 <<<");
        
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
        System.out.println(">>> Failed to find postgres password in second dictionary <<<");
    }
}

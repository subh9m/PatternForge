package com.patternforge;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

@SpringBootApplication
@EnableScheduling
public class PatternForgeApplication {

    public static void main(String[] args) {
        // Auto-create database 'patternforge' if it doesn't exist
        try {
            Class.forName("org.postgresql.Driver");
            String url = "jdbc:postgresql://localhost:5432/postgres";
            String username = "postgres";
            String password = "postgres"; // local password configured
            
            try (Connection conn = DriverManager.getConnection(url, username, password);
                 Statement stmt = conn.createStatement()) {
                
                ResultSet rs = stmt.executeQuery("SELECT 1 FROM pg_database WHERE datname = 'patternforge'");
                if (!rs.next()) {
                    stmt.executeUpdate("CREATE DATABASE patternforge");
                    System.out.println("PatternForge startup: Created database 'patternforge' successfully!");
                } else {
                    System.out.println("PatternForge startup: Database 'patternforge' already exists.");
                }
            }
        } catch (Exception e) {
            System.err.println("PatternForge startup: Auto-database creation check skipped or failed: " + e.getMessage());
        }

        SpringApplication.run(PatternForgeApplication.class, args);
    }

    @org.springframework.context.annotation.Bean
    public org.springframework.boot.CommandLineRunner debugUsers(
            com.patternforge.repository.UserRepository userRepository,
            org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        return args -> {
            System.out.println("==================================================");
            System.out.println("DEBUG: Registered Users in PatternForge Database:");
            userRepository.findAll().forEach(user -> {
                System.out.println(" - Username: " + user.getUsername() + ", Email: " + user.getEmail() + ", ID: " + user.getId());
            });
            System.out.println("==================================================");
        };
    }
}

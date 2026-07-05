package com.patternforge.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DriverManager;
import java.util.HashMap;
import java.util.Map;

@Configuration
public class DataSourceConfig {

    @Value("${spring.datasource.url}")
    private String pgUrl;

    @Value("${spring.datasource.username}")
    private String pgUsername;

    @Value("${spring.datasource.password}")
    private String pgPassword;

    private final ConfigurableEnvironment environment;

    public DataSourceConfig(ConfigurableEnvironment environment) {
        this.environment = environment;
    }

    @Bean
    @Primary
    public DataSource dataSource() {
        System.out.println("PatternForge DataSource: Attempting to connect to PostgreSQL...");
        try {
            Class.forName("org.postgresql.Driver");
            try (Connection conn = DriverManager.getConnection(pgUrl, pgUsername, pgPassword)) {
                System.out.println("PatternForge DataSource: Connected to PostgreSQL successfully!");
                return DataSourceBuilder.create()
                        .url(pgUrl)
                        .username(pgUsername)
                        .password(pgPassword)
                        .driverClassName("org.postgresql.Driver")
                        .build();
            }
        } catch (Exception e) {
            System.err.println("PatternForge DataSource: PostgreSQL connection failed (" + e.getMessage() + ")");
            System.err.println("PatternForge DataSource: Automatically falling back to H2 File-Based Database!");

            // Override Hibernate dialect for H2
            Map<String, Object> h2Props = new HashMap<>();
            h2Props.put("spring.jpa.database-platform", "org.hibernate.dialect.H2Dialect");
            environment.getPropertySources().addFirst(new MapPropertySource("h2-fallback", h2Props));

            return DataSourceBuilder.create()
                    .url("jdbc:h2:file:~/.patternforge/data;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;MODE=PostgreSQL")
                    .username("sa")
                    .password("")
                    .driverClassName("org.h2.Driver")
                    .build();
        }
    }
}

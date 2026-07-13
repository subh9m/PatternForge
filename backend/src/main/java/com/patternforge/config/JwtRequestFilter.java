package com.patternforge.config;

import com.patternforge.model.LeetCodeSyncToken;
import com.patternforge.repository.LeetCodeSyncTokenRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;
    private final LeetCodeSyncTokenRepository syncTokenRepository;

    public JwtRequestFilter(JwtUtils jwtUtils, LeetCodeSyncTokenRepository syncTokenRepository) {
        this.jwtUtils = jwtUtils;
        this.syncTokenRepository = syncTokenRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        final String authorizationHeader = request.getHeader("Authorization");

        String username = null;
        UUID userId = null;
        String jwt = null;
        boolean isSyncToken = false;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7).trim();
            if (jwt.startsWith("pf_lc_")) {
                isSyncToken = true;
            } else {
                try {
                    if (jwtUtils.validateToken(jwt)) {
                        username = jwtUtils.getUsernameFromToken(jwt);
                        userId = jwtUtils.getUserIdFromToken(jwt);
                    }
                } catch (Exception e) {
                    // Ignore exception
                }
            }
        }

        if (isSyncToken && SecurityContextHolder.getContext().getAuthentication() == null) {
            String hash = hashToken(jwt);
            Optional<LeetCodeSyncToken> tokenOpt = syncTokenRepository.findByTokenHash(hash);
            if (tokenOpt.isPresent()) {
                LeetCodeSyncToken token = tokenOpt.get();
                if (!token.isRevoked()) {
                    userId = token.getUserId();
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userId, // Principal is the UUID
                            "sync_token", // Credentials
                            Collections.singletonList(new SimpleGrantedAuthority("ROLE_LEETCODE_SYNC"))
                    );
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        } else if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            // Create user authentication token
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    userId, // Principal is the UUID
                    username, // Credentials is the username string
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
            );
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to hash token", e);
        }
    }
}

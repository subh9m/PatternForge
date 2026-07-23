package com.patternforge.exception;

public class AIProviderException extends RuntimeException {
    private final String providerName;
    private final int statusCode;
    private final boolean retryable;

    public AIProviderException(String providerName, int statusCode, String message, boolean retryable) {
        super(message);
        this.providerName = providerName;
        this.statusCode = statusCode;
        this.retryable = retryable;
    }

    public AIProviderException(String providerName, String message, boolean retryable, Throwable cause) {
        super(message, cause);
        this.providerName = providerName;
        this.statusCode = -1;
        this.retryable = retryable;
    }

    public String getProviderName() {
        return providerName;
    }

    public int getStatusCode() {
        return statusCode;
    }

    public boolean isRetryable() {
        return retryable;
    }
}

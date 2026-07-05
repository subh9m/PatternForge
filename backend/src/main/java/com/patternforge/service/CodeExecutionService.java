package com.patternforge.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class CodeExecutionService {

    @Value("${patternforge.code.temp-dir}")
    private String tempDirPath;

    public static class ExecutionResult {
        public boolean success;
        public String output;
        public String error;
        public int exitCode;
        public long runTimeMs;
        public boolean isTimeout;

        public ExecutionResult(boolean success, String output, String error, int exitCode, long runTimeMs, boolean isTimeout) {
            this.success = success;
            this.output = output;
            this.error = error;
            this.exitCode = exitCode;
            this.runTimeMs = runTimeMs;
            this.isTimeout = isTimeout;
        }
    }

    public ExecutionResult executeCode(String code, String language, String input) {
        UUID executionId = UUID.randomUUID();
        Path executionFolder = Paths.get(tempDirPath, executionId.toString());

        try {
            Files.createDirectories(executionFolder);
        } catch (IOException e) {
            return new ExecutionResult(false, "", "Failed to create temp directories: " + e.getMessage(), -1, 0, false);
        }

        String sourceFileName;
        switch (language.toLowerCase()) {
            case "cpp":
                sourceFileName = "solution.cpp";
                break;
            case "java":
                sourceFileName = "Solution.java"; // Java requires matching class name
                break;
            case "python":
                sourceFileName = "solution.py";
                break;
            case "javascript":
                sourceFileName = "solution.js";
                break;
            default:
                cleanup(executionFolder.toFile());
                return new ExecutionResult(false, "", "Unsupported language: " + language, -1, 0, false);
        }

        File sourceFile = new File(executionFolder.toFile(), sourceFileName);
        try (FileWriter writer = new FileWriter(sourceFile)) {
            writer.write(code);
        } catch (IOException e) {
            cleanup(executionFolder.toFile());
            return new ExecutionResult(false, "", "Failed to write source code: " + e.getMessage(), -1, 0, false);
        }

        // Compilation step if needed
        long startTime = System.currentTimeMillis();
        if (language.equalsIgnoreCase("cpp")) {
            ExecutionResult compileRes = runCommand(
                    executionFolder.toFile(),
                    new String[]{"g++", "solution.cpp", "-o", "solution.exe"},
                    "",
                    10000 // 10s compile limit
            );
            if (compileRes.exitCode != 0) {
                cleanup(executionFolder.toFile());
                return new ExecutionResult(false, "", "Compilation Error:\n" + compileRes.error, compileRes.exitCode, 0, false);
            }
        } else if (language.equalsIgnoreCase("java")) {
            ExecutionResult compileRes = runCommand(
                    executionFolder.toFile(),
                    new String[]{"javac", "Solution.java"},
                    "",
                    10000
            );
            if (compileRes.exitCode != 0) {
                cleanup(executionFolder.toFile());
                return new ExecutionResult(false, "", "Compilation Error:\n" + compileRes.error, compileRes.exitCode, 0, false);
            }
        }

        // Execution step
        String[] runCommandArgs;
        switch (language.toLowerCase()) {
            case "cpp":
                runCommandArgs = new String[]{new File(executionFolder.toFile(), "solution.exe").getAbsolutePath()};
                break;
            case "java":
                runCommandArgs = new String[]{"java", "-cp", ".", "Solution"};
                break;
            case "python":
                runCommandArgs = new String[]{"python", "solution.py"};
                break;
            case "javascript":
                runCommandArgs = new String[]{"node", "solution.js"};
                break;
            default:
                cleanup(executionFolder.toFile());
                return new ExecutionResult(false, "", "Unsupported language runtime", -1, 0, false);
        }

        long executeStart = System.currentTimeMillis();
        ExecutionResult executeRes = runCommand(
                executionFolder.toFile(),
                runCommandArgs,
                input != null ? input : "",
                5000 // 5s execution limit
        );
        long runTime = System.currentTimeMillis() - executeStart;

        cleanup(executionFolder.toFile());
        
        return new ExecutionResult(
                executeRes.exitCode == 0,
                executeRes.output,
                executeRes.error,
                executeRes.exitCode,
                runTime,
                executeRes.isTimeout
        );
    }

    private ExecutionResult runCommand(File directory, String[] command, String stdin, long timeoutMs) {
        StringBuilder stdout = new StringBuilder();
        StringBuilder stderr = new StringBuilder();
        boolean isTimeout = false;
        int exitCode = -1;

        try {
            ProcessBuilder pb = new ProcessBuilder(command);
            pb.directory(directory);
            Process process = pb.start();

            // Write stdin
            if (stdin != null && !stdin.isEmpty()) {
                try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(process.getOutputStream()))) {
                    writer.write(stdin);
                    writer.flush();
                }
            } else {
                process.getOutputStream().close();
            }

            // Read stdout
            Thread outThread = new Thread(() -> {
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        stdout.append(line).append("\n");
                    }
                } catch (IOException e) {
                    // Ignore
                }
            });

            // Read stderr
            Thread errThread = new Thread(() -> {
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getErrorStream()))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        stderr.append(line).append("\n");
                    }
                } catch (IOException e) {
                    // Ignore
                }
            });

            outThread.start();
            errThread.start();

            boolean finished = process.waitFor(timeoutMs, TimeUnit.MILLISECONDS);
            if (!finished) {
                isTimeout = true;
                process.destroyForcibly();
            } else {
                exitCode = process.exitValue();
            }

            outThread.join(1000);
            errThread.join(1000);

        } catch (Exception e) {
            stderr.append("Execution error: ").append(e.getMessage());
        }

        return new ExecutionResult(exitCode == 0, stdout.toString().trim(), stderr.toString().trim(), exitCode, 0, isTimeout);
    }

    private void cleanup(File file) {
        if (file.isDirectory()) {
            File[] files = file.listFiles();
            if (files != null) {
                for (File f : files) {
                    cleanup(f);
                }
            }
        }
        file.delete();
    }
}

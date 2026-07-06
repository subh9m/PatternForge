# --- Build Stage ---
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
# Cache dependencies
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests

# --- Run Stage ---
FROM eclipse-temurin:21-jdk
WORKDIR /app

# Install compilation tools and runtimes: GCC/G++, Python3, Node.js
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    python3-pip \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Create symlink for python so that the "python" command is available for executing scripts
RUN ln -s /usr/bin/python3 /usr/bin/python

# Copy the built jar from build stage
COPY --from=build /app/target/backend-0.0.1-SNAPSHOT.jar app.jar

# Expose default port
EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar"]

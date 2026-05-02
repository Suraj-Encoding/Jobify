## DockerFile: For "Java" Application ##

## Stage-1: Build the "Java" application

# Start from the latest "Eclipse Temurin JDK" base image (alpine)
FROM eclipse-temurin:17-jdk-alpine as build

# Set the 'app' as a 'CWD' inside the 'container'
WORKDIR /app

# Copy the 'pom.xml' file first to 'leverage' the 'Docker' layer 'caching'
COPY pom.xml .

# Copy the 'src' folder
COPY src ./src

# Install 'Maven' and download all the 'dependencies'
RUN apk add --no-cache maven

# Build the "Java" application (skip tests for faster build)
RUN mvn clean package -DskipTests

## Stage-2: Run the "Java" application

# Start from the latest "Eclipse Temurin JRE" base image (alpine)
FROM eclipse-temurin:17-jre-alpine

# Set the 'app' as a 'CWD' inside the 'container'
WORKDIR /app

# Copy the 'JAR' file from the 'build' stage
COPY --from=build /app/target/jobify-1.0.0.jar app.jar

# Expose the port "3001" to the 'outside' world
EXPOSE 3001

# Run the 'JAR' program
ENTRYPOINT ["java", "-jar", "app.jar"]

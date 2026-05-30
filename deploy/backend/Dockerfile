FROM eclipse-temurin:17-jre

WORKDIR /app

ARG JAR_FILE=target/daily-question-1.0.0.jar
COPY ${JAR_FILE} app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar", "--spring.profiles.active=prod"]

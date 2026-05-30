package com.dailyquestion;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.dailyquestion.mapper")
public class DailyQuestionApplication {

    public static void main(String[] args) {
        SpringApplication.run(DailyQuestionApplication.class, args);
    }
}

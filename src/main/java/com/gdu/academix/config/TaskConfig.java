package com.gdu.academix.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

import com.gdu.academix.scheduler.RemoveBlogImageScheduler;
import com.gdu.academix.scheduler.RemoveEmptyChatroomsScheduler;
import com.gdu.academix.scheduler.RemoveTempFilesScheduler;

@EnableScheduling
@Configuration
public class TaskConfig {

	@Bean
	RemoveBlogImageScheduler removeBlogImageTask() {
		return new RemoveBlogImageScheduler();
	}

	@Bean
	RemoveTempFilesScheduler removeTempFileTask() {
		return new RemoveTempFilesScheduler();
	}

	@Bean
	RemoveEmptyChatroomsScheduler removeEmptyChatrooms() {
	  return new RemoveEmptyChatroomsScheduler();
	}
}

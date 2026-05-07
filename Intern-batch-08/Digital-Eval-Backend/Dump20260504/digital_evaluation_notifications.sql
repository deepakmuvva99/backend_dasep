-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: dasep-mysql-test-01.mysql.database.azure.com    Database: digital_evaluation
-- ------------------------------------------------------
-- Server version	8.0.44-azure

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `notification_id` bigint NOT NULL AUTO_INCREMENT COMMENT 'Unique notification identifier',
  `user_id` int NOT NULL COMMENT 'Reference to user who receives notification',
  `entity_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Entity type that triggered notification',
  `entity_id` bigint NOT NULL COMMENT 'ID of the entity that triggered notification',
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Notification message',
  `is_read` tinyint(1) DEFAULT '0' COMMENT 'Whether user has read the notification',
  `sent_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Notification sent timestamp',
  `read_at` timestamp NULL DEFAULT NULL COMMENT 'Timestamp when notification was read',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
  PRIMARY KEY (`notification_id`),
  KEY `idx_user_unread_time` (`user_id`,`is_read`,`sent_at`),
  KEY `idx_sent_at` (`sent_at`),
  KEY `idx_entity_type_id` (`entity_type`,`entity_id`),
  CONSTRAINT `fk_notifications_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User notifications';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,7,'submission',1,'Your submission (ID: 1) has been evaluated. Marks: 88/100',0,'2026-04-24 12:36:09',NULL,'2026-04-24 12:36:09'),(2,2,'exam_deadline',1,'The deadline for Mathematics has passed. Please begin evaluating the submissions.',0,'2026-05-01 10:10:00',NULL,'2026-05-01 10:10:00'),(3,6,'exam_deadline',3,'The deadline for Physics has passed. Please begin evaluating the submissions.',0,'2026-05-02 05:37:00',NULL,'2026-05-02 05:37:00'),(4,3,'exam_deadline',2,'The deadline for Science has passed. Please begin evaluating the submissions.',0,'2026-05-02 16:56:00',NULL,'2026-05-02 16:56:00'),(5,3,'exam_deadline',2,'The deadline for Science has passed. Please begin evaluating the submissions.',0,'2026-05-02 16:56:00',NULL,'2026-05-02 16:56:00');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-04 14:37:58

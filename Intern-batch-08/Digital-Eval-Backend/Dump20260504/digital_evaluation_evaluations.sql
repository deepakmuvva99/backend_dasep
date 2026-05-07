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
-- Table structure for table `evaluations`
--

DROP TABLE IF EXISTS `evaluations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `evaluations` (
  `evaluation_id` bigint NOT NULL AUTO_INCREMENT COMMENT 'Unique evaluation identifier',
  `submission_id` bigint NOT NULL COMMENT 'Reference to submission being evaluated',
  `faculty_id` int NOT NULL COMMENT 'Reference to faculty doing evaluation',
  `marks_awarded` int NOT NULL COMMENT 'Marks awarded by faculty',
  `max_marks` int NOT NULL COMMENT 'Maximum possible marks',
  `remarks` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Evaluation remarks/feedback',
  `status_id` int NOT NULL COMMENT 'Reference to evaluation status',
  `evaluated_at` datetime NOT NULL COMMENT 'Evaluation completion timestamp',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT 'Soft delete timestamp',
  PRIMARY KEY (`evaluation_id`),
  UNIQUE KEY `unique_submission_evaluation` (`submission_id`,`faculty_id`),
  KEY `idx_faculty_id` (`faculty_id`),
  KEY `idx_evaluated_at` (`evaluated_at`),
  KEY `idx_faculty_status` (`faculty_id`,`status_id`),
  KEY `fk_evaluations_status_id` (`status_id`),
  CONSTRAINT `fk_evaluations_faculty_id` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`faculty_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_evaluations_status_id` FOREIGN KEY (`status_id`) REFERENCES `evaluation_status` (`evaluation_status_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_evaluations_submission_id` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`submission_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_marks_non_negative` CHECK ((`marks_awarded` >= 0)),
  CONSTRAINT `chk_marks_within_max` CHECK ((`marks_awarded` <= `max_marks`)),
  CONSTRAINT `chk_max_marks_positive` CHECK ((`max_marks` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Evaluations of student submissions';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `evaluations`
--

LOCK TABLES `evaluations` WRITE;
/*!40000 ALTER TABLE `evaluations` DISABLE KEYS */;
INSERT INTO `evaluations` VALUES (1,1,3,88,100,'Evaluated on 2026-04-24 18:06:09',2,'2026-04-24 18:06:09','2026-04-24 12:36:09','2026-05-04 04:32:37',NULL);
/*!40000 ALTER TABLE `evaluations` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-04 14:37:48

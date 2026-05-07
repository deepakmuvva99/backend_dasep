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
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `audit_log_id` bigint NOT NULL AUTO_INCREMENT COMMENT 'Unique audit log identifier',
  `entity_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Entity type changed (e.g., submissions, evaluations)',
  `entity_id` bigint NOT NULL COMMENT 'ID of the entity that was changed',
  `field_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Field name that was changed',
  `old_value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Previous value',
  `new_value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'New value',
  `changed_by_user_id` int NOT NULL COMMENT 'Reference to user who made the change',
  `changed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Change timestamp',
  PRIMARY KEY (`audit_log_id`,`changed_at`),
  KEY `idx_entity_type_id` (`entity_type`,`entity_id`),
  KEY `idx_changed_by_user_id` (`changed_by_user_id`),
  KEY `idx_changed_at` (`changed_at`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Audit trail of all data changes'
/*!50100 PARTITION BY RANGE (unix_timestamp(`changed_at`))
(PARTITION p2024 VALUES LESS THAN (1735669800) ENGINE = InnoDB,
 PARTITION p2025 VALUES LESS THAN (1767205800) ENGINE = InnoDB,
 PARTITION p2026 VALUES LESS THAN (1798741800) ENGINE = InnoDB,
 PARTITION p2027 VALUES LESS THAN (1830277800) ENGINE = InnoDB,
 PARTITION p2028 VALUES LESS THAN (1861900200) ENGINE = InnoDB,
 PARTITION pmax VALUES LESS THAN MAXVALUE ENGINE = InnoDB) */;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,'evaluations',1,'status','Pending','Completed',6,'2026-04-24 12:36:09'),(2,'evaluations',1,'marks_awarded',NULL,'88',6,'2026-04-24 12:36:09'),(3,'evaluations',1,'all','{\"marks_awarded\":88,\"status_id\":3}','{\"marks_awarded\":88,\"status_id\":2}',1,'2026-05-04 04:32:37'),(4,'evaluations',1,'all','{\"marks_awarded\":88,\"status_id\":2}','{\"marks_awarded\":88,\"status_id\":2}',1,'2026-05-04 05:05:31');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-04 14:38:00

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
-- Table structure for table `annotation_types`
--

DROP TABLE IF EXISTS `annotation_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `annotation_types` (
  `annotation_type_id` int NOT NULL AUTO_INCREMENT COMMENT 'Unique annotation type identifier',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Annotation type name',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Annotation type description',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Type creation timestamp',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
  PRIMARY KEY (`annotation_type_id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Types of annotations on answer sheets';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `annotation_types`
--

LOCK TABLES `annotation_types` WRITE;
/*!40000 ALTER TABLE `annotation_types` DISABLE KEYS */;
INSERT INTO `annotation_types` VALUES (1,'Text Comment','Written feedback','2026-04-24 10:26:37','2026-04-24 10:26:37'),(2,'Highlight','Highlighted area','2026-04-24 10:26:37','2026-04-24 10:26:37'),(3,'Mark','Tick/Cross','2026-04-24 10:26:37','2026-04-24 10:26:37'),(4,'comment',NULL,'2026-04-24 12:36:09','2026-04-24 12:36:09'),(5,'underline',NULL,'2026-04-24 12:36:09','2026-04-24 12:36:09'),(6,'draw',NULL,'2026-04-24 12:36:09','2026-04-24 12:36:09');
/*!40000 ALTER TABLE `annotation_types` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-04 14:37:53

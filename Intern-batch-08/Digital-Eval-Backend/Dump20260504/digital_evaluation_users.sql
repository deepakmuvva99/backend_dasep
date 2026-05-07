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
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT COMMENT 'Unique user identifier',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'User full name',
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'User email address',
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Hashed password',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Account creation timestamp',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT 'Soft delete timestamp',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_active_users` (`deleted_at`,`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User accounts for the system';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'System Admin','admin@school.com','$2b$10$a.waoyQH/DR40gafbJTVpuKR8Gy26KU1VNkjJ4iWH/6omdtcuH6ma','2026-04-24 10:26:37','2026-04-28 10:10:39',NULL),(2,'John Teacher','teacher1@school.com','$2b$10$Tbhs4kw5L25YJek0CTgot.3YEaQPBaZJlWtDGvXxoDEiQJG0sONmi','2026-04-24 10:26:37','2026-04-24 11:28:48',NULL),(3,'Mary Teacher','teacher2@school.com','$2b$10$Tbhs4kw5L25YJek0CTgot.3YEaQPBaZJlWtDGvXxoDEiQJG0sONmi','2026-04-24 10:26:37','2026-04-24 11:28:48',NULL),(4,'Alice Student','student1@school.com','$2b$10$Tbhs4kw5L25YJek0CTgot.3YEaQPBaZJlWtDGvXxoDEiQJG0sONmi','2026-04-24 10:26:37','2026-04-24 11:28:48',NULL),(5,'Bob Student','student2@school.com','$2b$10$Tbhs4kw5L25YJek0CTgot.3YEaQPBaZJlWtDGvXxoDEiQJG0sONmi','2026-04-24 10:26:37','2026-04-24 11:28:48',NULL),(6,'Jane Doe','jane.doe@test.com','$2b$10$XxtUUI4LMS3iKshmRSbT1.7mpqpGcvcolMa6wy0HvkqkQA4fYgVrK','2026-04-24 11:33:23','2026-04-24 11:33:23',NULL),(7,'Alice Johnson','alice_1777034168@school.com','fab43a1cee344bfbb41d2beb1348fcf3a848b5de945de7fcaae002e383429e88','2026-04-24 12:36:08','2026-04-24 12:36:08',NULL),(8,'Bob Smith','bob_1777034168@school.com','3f4f566471fa7817b959662e1044568b66b2c0e1aefd09edc9742763304e4d2c','2026-04-24 12:36:08','2026-04-24 12:36:08',NULL),(9,'Yesh','kyeswanth.sdc@ndmatrix.in','$2b$10$XaLCckPhROtKnKbtAjyO6eeWzf1KMESEzCYLxM12arnbcls/6OHH2','2026-04-27 10:45:36','2026-04-27 10:45:36',NULL),(10,'Yesh1','yeswanthkumarkaluva@gmail.com','$2b$10$pscQdnIyjBJhf56RUAKZ7eqmjefye0/Z/P7AkRirvti.Jkto4bhYe','2026-04-27 10:55:14','2026-04-27 10:55:14',NULL),(12,'sasi','maruturisasi@gmail.com','$2b$10$07lsV21lk5IH/5rAF6oYOu3pe2Hg4Eynzt97.KIfuw.XkAb15ycZW','2026-04-27 11:06:23','2026-04-27 11:06:23',NULL),(13,'deepak','deepakmuvva99@gmail.com','$2b$10$qB/pNG62fUxfjkAmHQK4GeqRuHzpCqZ0FlwQy.qnuWu9fK/B0H8qG','2026-04-27 11:11:08','2026-04-27 11:11:08',NULL),(14,'deepakmuvva','mdeepak.sdc@ndmatrix.in','$2b$10$rwVB9UCMFDD8/2MPA.blhuqF3YQOx.WxXLrtOa5O/6k3n9HnrM.Pq','2026-04-27 11:27:00','2026-04-27 11:27:00',NULL),(15,'harsh','harsh@gmail.com','$2b$10$fq7LZlqE53rzdWFy0OnGRuTkDvOqEafyQcIufG5l9kIF66lX7sOBW','2026-04-27 11:40:36','2026-04-27 11:40:36',NULL),(16,'harshi','harshi@gmail.com','$2b$10$dvEEL8MeY3K.nqCf6chQxuPV/BO9RmE8NUUbrfma2QxR7xQHhZIgi','2026-04-27 11:41:08','2026-04-27 11:41:08',NULL),(17,'yas','1758505yaswanthkumar@gmail.com','$2b$10$K4fe8thEgF27cZlqSh8qa.NVnu0/iFSgdpkEhC9Kjofisf.FmC5y6','2026-04-27 11:42:39','2026-04-27 11:42:39',NULL),(18,'yeshh','yeswanthkumar219@gmail.com','$2b$10$KHNCSaNNGA.dYIDuK.eVIuECZqYuzrEvhOMCREC3thBkCipvh4N0i','2026-04-27 11:44:11','2026-04-27 11:44:11',NULL),(19,'yesssuu','yeswanthkaluva219@gmail.com','$2b$10$GE8j7CucyHYT.7KuIkPHo.rVJvQ1/S0oiSx62qT.Wl..kUBNBWjny','2026-04-27 11:48:05','2026-04-29 10:39:38',NULL),(22,'sonalisharma','ssonali.sdc@ndmatrix.in','$2b$10$h.Wp49RQVaOLbaEUR/6PreFeK9yarSU9XQoLVQFCle8QvwVvtxTJi','2026-04-27 12:20:48','2026-04-27 12:22:25','2026-04-27 12:22:25'),(23,'fac99','fac99@gmail.com','$2b$10$.wvB.M95iLCodPEuy69YRe283QVxBa9HMSOMSHrb5bGS6q699u1aG','2026-04-27 12:24:57','2026-04-27 12:24:57',NULL),(25,'wefwesfer','wefewerf@gmail.com','$2b$10$3uQObGLxHlpUefR.xx3syeOl1r7/aaejHDFv4JkUpwKBSKV.jEJpq','2026-04-27 12:44:02','2026-04-27 12:44:02',NULL),(26,'yesssuusdvcsdv','yeswanthkaluva2fgfg19@gmail.com','$2b$10$ZUX26y3Bn1A02B5Kkoi0jucu04aAVAPJO0TJvlVcwlu5cJehmPZAO','2026-04-28 11:21:22','2026-04-28 11:21:22',NULL),(28,'yesssuusdvcsdvfsd','yeswanthkalusssva2fgfg19@gmail.com','$2b$10$JODS23K4EqGDG8426GTyQe0mNHB2sL864SWJH0HbDH.BK8ApB6eAe','2026-04-29 12:34:56','2026-04-29 12:34:56',NULL),(29,'sonali','radheraja24@gmail.com','$2b$10$hxjevgjV5lL68JMCHPgiPu2aS1KK5uHZXppoPRSBo6d5Be6smkA/W','2026-04-29 13:00:06','2026-04-29 13:00:06',NULL),(30,'sasi','sasigaming1@gmail.com','$2b$10$nj8TOAnLUp/5djKttqmn1.O6ylEZe8WoKQMQ5JQH.Fo2QcCbj8Lby','2026-04-29 13:09:31','2026-04-29 13:09:31',NULL),(31,'sonaliSharma','sonalimvgr@gmail.com','$2b$10$R6THXfp3tQLeaCh2HZ6sQe/3Ksl53Wxv8tGEFK3SViJmog9nGdGV2','2026-04-30 08:53:14','2026-04-30 08:53:14',NULL),(33,'Harthik','kharthik.sdc@ndmatrix.in','$2b$10$g8aCn6InWZyhJZh4XWT5BeCQAOxAJyGHsuyzWwnvW7na3LdwcyFnS','2026-04-30 09:19:05','2026-04-30 09:20:42',NULL),(34,'deepu','deepu@gmail.com','$2b$10$S0qP.Q1gAensP3UAPrh0ve2H2ZNAj.TlF6z/oAGCe4IkML2g2Tk1m','2026-04-30 11:52:15','2026-04-30 11:52:15',NULL),(35,'deepu','www.deepakmuvva12345@gmail.com','$2b$10$0XzEXKCziZfhbISIJErpketP/asv7miUW1DPqjM49gl.pGjpmXfQe','2026-05-02 18:09:43','2026-05-02 18:09:43',NULL),(36,'Deep','221FA18076@vignan.ac.in','$2b$10$Zf.Bw18h6sHv3DR90i6byOjtjcCmCV0mwroR3s.blHGXdoQtT5iIe','2026-05-02 19:06:14','2026-05-02 19:06:14',NULL),(37,'maaa','mahi8106368@gmail.com','$2b$10$Hmigrurh6ea73c6/s4Gy8.Pu4q8vqZwL/AhE/1N/8iVduP2p0Xwsa','2026-05-02 19:08:28','2026-05-02 19:08:28',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-04 14:37:49

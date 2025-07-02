-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: ems
-- ------------------------------------------------------
-- Server version	8.0.41

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
-- Table structure for table `task_templates`
--

DROP TABLE IF EXISTS `task_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task_templates` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `title` varchar(255) NOT NULL,
  `description` text,
  `priority` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `default_assignee` varchar(36) DEFAULT NULL,
  `created_by` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `default_assignee` (`default_assignee`),
  CONSTRAINT `task_templates_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `employee` (`empId`),
  CONSTRAINT `task_templates_ibfk_2` FOREIGN KEY (`default_assignee`) REFERENCES `employee` (`empId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task_templates`
--

LOCK TABLES `task_templates` WRITE;
/*!40000 ALTER TABLE `task_templates` DISABLE KEYS */;
INSERT INTO `task_templates` VALUES ('00000000-0000-0000-0000-000000000070','2025-06-23 20:54:14','2025-06-23 20:54:14','Performance Review','Conduct annual performance review','High','HR','kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk','kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk'),('00000000-0000-0000-0000-000000000071','2025-06-23 20:54:14','2025-06-23 20:54:14','Financial Audit','Perform quarterly financial audit','Medium','Finance','llllllll-llll-llll-llll-llllllllllll','llllllll-llll-llll-llll-llllllllllll'),('00000000-0000-0000-0000-000000000072','2025-06-23 20:54:14','2025-06-23 20:54:14','System Maintenance','Perform monthly system maintenance','Low','IT','nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn','nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn');
/*!40000 ALTER TABLE `task_templates` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-01 13:10:05

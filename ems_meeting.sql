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
-- Table structure for table `meeting`
--

DROP TABLE IF EXISTS `meeting`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `meeting` (
  `meetingId` varchar(36) NOT NULL DEFAULT (uuid()),
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `topic` varchar(255) DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `empId` varchar(36) DEFAULT (uuid()),
  `startTime` time DEFAULT NULL,
  `endTime` time DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `description` text,
  `status` enum('scheduled','completed','canceled') DEFAULT 'scheduled',
  PRIMARY KEY (`meetingId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `meeting`
--

LOCK TABLES `meeting` WRITE;
/*!40000 ALTER TABLE `meeting` DISABLE KEYS */;
INSERT INTO `meeting` VALUES ('00000000-0000-0000-0000-000000000023','2025-06-23 20:52:37','Quarterly Review','2023-01-10 00:00:00','Management','kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk',NULL,NULL,NULL,NULL,'scheduled'),('00000000-0000-0000-0000-000000000024','2025-06-23 20:52:37','Budget Planning','2023-01-12 00:00:00','Finance','llllllll-llll-llll-llll-llllllllllll',NULL,NULL,NULL,NULL,'scheduled'),('00000000-0000-0000-0000-000000000025','2025-06-23 20:52:37','Operations Update','2023-01-15 00:00:00','Operations','mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm',NULL,NULL,NULL,NULL,'scheduled'),('0897190f-52be-11f0-a786-89d48e4ac80b','2025-06-26 18:47:38','Schedule Meeting Test','2025-06-27 00:00:00','board','83eda5b2-bbdd-4b95-99c6-eab3a1b1abf5',NULL,NULL,NULL,NULL,'scheduled'),('3699b2b0-54b1-11f0-a21c-cc5e72225339','2025-06-29 06:20:55','Meeting Test 2','2025-07-01 03:50:00','regular','83eda5b2-bbdd-4b95-99c6-eab3a1b1abf5','03:50:00','11:55:00','Board Room','Meeting','scheduled'),('36bfff90-54b4-11f0-a21c-cc5e72225339','2025-06-29 06:42:23','Meeting Test 2','2025-07-08 00:00:00','strategy','83eda5b2-bbdd-4b95-99c6-eab3a1b1abf5','06:12:00','10:12:00','Board Room','Meeting','scheduled'),('5b13be5b-54ab-11f0-a21c-cc5e72225339','2025-06-29 05:38:59','Quarterly Strategy Review','2025-06-27 14:00:00','board','83eda5b2-bbdd-4b95-99c6-eab3a1b1abf5','14:00:00','16:00:00','Board Room','Discuss Q2 results and Q3 planning','scheduled'),('9841ee81-54a1-11f0-a21c-cc5e72225339','2025-06-29 04:29:06','Schedule Meeting Second','2025-06-27 00:00:00','board','83eda5b2-bbdd-4b95-99c6-eab3a1b1abf5',NULL,NULL,NULL,NULL,'scheduled'),('cb67daf3-54f5-11f0-97eb-59848b2e43c7','2025-06-29 14:31:50','Meeting No 03','2025-07-10 00:00:00','review','c637cf0f-2b0a-4ba6-aa59-16aadbf5883d','14:07:00','15:01:00','Conference Room B','Meeting No 03','scheduled'),('dbd656ac-54b6-11f0-a21c-cc5e72225339','2025-06-29 07:01:19','Today','2025-06-29 00:00:00','department','83eda5b2-bbdd-4b95-99c6-eab3a1b1abf5','13:30:00','14:31:00','Executive Suite','Today','scheduled'),('e11ad105-54ad-11f0-a21c-cc5e72225339','2025-06-29 05:57:03','Meeting 01','2025-06-24 15:30:00','regular','83eda5b2-bbdd-4b95-99c6-eab3a1b1abf5','15:30:00','16:30:00','Conference Room A','Meeting Agenda','scheduled'),('fffd70da-54a6-11f0-a21c-cc5e72225339','2025-06-29 05:07:48','Schedule Meeting Second','2025-06-27 00:00:00','board','83eda5b2-bbdd-4b95-99c6-eab3a1b1abf5',NULL,NULL,NULL,NULL,'scheduled');
/*!40000 ALTER TABLE `meeting` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-01 13:10:08

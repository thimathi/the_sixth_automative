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
-- Table structure for table `increment`
--

DROP TABLE IF EXISTS `increment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `increment` (
  `incrementId` varchar(36) NOT NULL DEFAULT (uuid()),
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `percenatge` double DEFAULT NULL,
  `lastIncrementDate` date DEFAULT NULL,
  `nextIncrementDate` date DEFAULT NULL,
  `amount` double DEFAULT NULL,
  `approval` varchar(255) DEFAULT NULL,
  `empId` varchar(36) DEFAULT (uuid()),
  `processed_by` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`incrementId`),
  KEY `empId` (`empId`),
  KEY `processed_by` (`processed_by`),
  CONSTRAINT `increment_ibfk_1` FOREIGN KEY (`empId`) REFERENCES `employee` (`empId`),
  CONSTRAINT `increment_ibfk_2` FOREIGN KEY (`processed_by`) REFERENCES `employee` (`empId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `increment`
--

LOCK TABLES `increment` WRITE;
/*!40000 ALTER TABLE `increment` DISABLE KEYS */;
INSERT INTO `increment` VALUES ('00000000-0000-0000-0000-000000000038','2025-06-23 20:52:37',5,'2022-12-01','2023-12-01',2500,'Approved','kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk','llllllll-llll-llll-llll-llllllllllll'),('00000000-0000-0000-0000-000000000039','2025-06-23 20:52:37',7,'2022-12-01','2023-12-01',3150,'Approved','llllllll-llll-llll-llll-llllllllllll',NULL),('00000000-0000-0000-0000-000000000040','2025-06-23 20:52:37',6,'2022-12-01','2023-12-01',2400,'Approved','mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm',NULL);
/*!40000 ALTER TABLE `increment` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-01 13:10:00

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
-- Table structure for table `epfnetf`
--

DROP TABLE IF EXISTS `epfnetf`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `epfnetf` (
  `epfAndEtfId` varchar(36) NOT NULL DEFAULT (uuid()),
  `appliedDate` timestamp NOT NULL,
  `basicSalary` double DEFAULT NULL,
  `epfCalculation` double DEFAULT NULL,
  `etfCalculation` double DEFAULT NULL,
  `processedBy` varchar(36) DEFAULT NULL,
  `processedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `empIdNumber` decimal(20,0) DEFAULT NULL,
  `empId` varchar(36) DEFAULT (uuid()),
  PRIMARY KEY (`epfAndEtfId`),
  KEY `empId` (`empId`),
  KEY `processedBy` (`processedBy`),
  CONSTRAINT `epfnetf_ibfk_1` FOREIGN KEY (`empId`) REFERENCES `employee` (`empId`),
  CONSTRAINT `epfnetf_ibfk_2` FOREIGN KEY (`processedBy`) REFERENCES `employee` (`empId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `epfnetf`
--

LOCK TABLES `epfnetf` WRITE;
/*!40000 ALTER TABLE `epfnetf` DISABLE KEYS */;
INSERT INTO `epfnetf` VALUES ('00000000-0000-0000-0000-000000000035','2023-01-04 18:30:00',50000,3000,1875,'llllllll-llll-llll-llll-llllllllllll','2025-06-23 20:52:37',123456789,'kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk'),('00000000-0000-0000-0000-000000000036','2023-01-04 18:30:00',45000,2700,1687.5,NULL,'2025-06-23 20:52:37',234567890,'llllllll-llll-llll-llll-llllllllllll'),('00000000-0000-0000-0000-000000000037','2023-01-04 18:30:00',40000,2400,1500,NULL,'2025-06-23 20:52:37',345678901,'mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm');
/*!40000 ALTER TABLE `epfnetf` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-01 13:10:01

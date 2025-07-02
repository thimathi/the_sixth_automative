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
-- Table structure for table `loanrequest`
--

DROP TABLE IF EXISTS `loanrequest`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loanrequest` (
  `loanRequestId` varchar(36) NOT NULL DEFAULT (uuid()),
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `duration` bigint DEFAULT NULL,
  `date` date DEFAULT NULL,
  `amount` bigint DEFAULT NULL,
  `interestRate` double DEFAULT NULL,
  `empId` varchar(36) DEFAULT (uuid()),
  `loanTypeId` varchar(36) DEFAULT (uuid()),
  `processedBy` varchar(45) DEFAULT NULL,
  `processedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`loanRequestId`),
  KEY `loanTypeId` (`loanTypeId`),
  KEY `empId` (`empId`),
  KEY `loanrequest_ibfk_3_idx` (`processedBy`),
  CONSTRAINT `loanrequest_ibfk_1` FOREIGN KEY (`loanTypeId`) REFERENCES `loantype` (`loanTypeId`),
  CONSTRAINT `loanrequest_ibfk_2` FOREIGN KEY (`empId`) REFERENCES `employee` (`empId`),
  CONSTRAINT `loanrequest_ibfk_3` FOREIGN KEY (`processedBy`) REFERENCES `employee` (`empId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loanrequest`
--

LOCK TABLES `loanrequest` WRITE;
/*!40000 ALTER TABLE `loanrequest` DISABLE KEYS */;
INSERT INTO `loanrequest` VALUES ('00000000-0000-0000-0000-000000000043','2025-06-23 20:52:37',24,'2023-01-05',10000,5.5,'kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk','cccccccc-cccc-cccc-cccc-cccccccccccc','llllllll-llll-llll-llll-llllllllllll','2025-06-23 20:52:37','Approved'),('00000000-0000-0000-0000-000000000044','2025-06-23 20:52:37',60,'2023-01-10',50000,4.5,'llllllll-llll-llll-llll-llllllllllll','dddddddd-dddd-dddd-dddd-dddddddddddd',NULL,'2025-06-23 20:52:37',NULL);
/*!40000 ALTER TABLE `loanrequest` ENABLE KEYS */;
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

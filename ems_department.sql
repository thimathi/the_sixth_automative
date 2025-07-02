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
-- Table structure for table `department`
--

DROP TABLE IF EXISTS `department`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `department` (
  `departmentId` varchar(36) NOT NULL DEFAULT (uuid()),
  `departmentName` varchar(255) NOT NULL,
  `managerId` varchar(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`departmentId`),
  UNIQUE KEY `departmentName` (`departmentName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `department`
--

LOCK TABLES `department` WRITE;
/*!40000 ALTER TABLE `department` DISABLE KEYS */;
INSERT INTO `department` VALUES ('Administration','Administration','SL00000006','2025-06-23 15:25:28'),('Audit','Audit','SL00000013','2025-06-23 15:25:28'),('Business Development','Business Development','SL00000015','2025-06-23 15:25:28'),('Compliance','Compliance','SL00000012','2025-06-23 15:25:28'),('Creative Design','Creative Design','SL00000018','2025-06-23 15:25:28'),('Customer Service','Customer Service','rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr','2025-06-23 15:25:28'),('Data Analytics','Data Analytics','SL00000017','2025-06-23 15:25:28'),('Facilities','Facilities','SL00000010','2025-06-23 15:25:28'),('Legal','Legal','SL00000005','2025-06-23 15:25:28'),('Logistics','Logistics','SL00000008','2025-06-23 15:25:28'),('Marketing','Marketing','pppppppp-pppp-pppp-pppp-pppppppppppp','2025-06-23 15:25:28'),('Procurement','Procurement','SL00000007','2025-06-23 15:25:28'),('Product Management','Product Management','SL00000016','2025-06-23 15:25:28'),('Public Relations','Public Relations','SL00000014','2025-06-23 15:25:28'),('Quality Assurance','Quality Assurance','tttttttt-tttt-tttt-tttt-tttttttttttt','2025-06-23 15:25:28'),('Research & Development','Research & Development','ssssssss-ssss-ssss-ssss-ssssssssssss','2025-06-23 15:25:28'),('Sales','Sales','oooooooo-oooo-oooo-oooo-oooooooooooo','2025-06-23 15:25:28'),('Security','Security','SL00000009','2025-06-23 15:25:28'),('Technical Support','Technical Support','SL00000019','2025-06-23 15:25:28'),('Training','Training','SL00000011','2025-06-23 15:25:28');
/*!40000 ALTER TABLE `department` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-01 13:10:04

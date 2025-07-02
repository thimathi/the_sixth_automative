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
-- Table structure for table `training`
--

DROP TABLE IF EXISTS `training`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `training` (
  `trainingId` varchar(36) NOT NULL DEFAULT (uuid()),
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `venue` varchar(255) DEFAULT NULL,
  `trainer` varchar(255) DEFAULT NULL,
  `topic` varchar(255) DEFAULT NULL,
  `duration` varchar(45) DEFAULT NULL,
  `date` varchar(45) DEFAULT NULL,
  `empId` varchar(36) DEFAULT (uuid()),
  PRIMARY KEY (`trainingId`),
  KEY `empId` (`empId`),
  CONSTRAINT `training_ibfk_1` FOREIGN KEY (`empId`) REFERENCES `employee` (`empId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `training`
--

LOCK TABLES `training` WRITE;
/*!40000 ALTER TABLE `training` DISABLE KEYS */;
INSERT INTO `training` VALUES ('00000000-0000-0000-0000-000000000029','2025-06-23 20:52:37','Conference Room A','External Consultant','Leadership Skills','8','2023-02-10','kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk'),('00000000-0000-0000-0000-000000000030','2025-06-23 20:52:37','Training Center','Finance Director','Advanced Excel','16','2023-02-15','llllllll-llll-llll-llll-llllllllllll'),('00000000-0000-0000-0000-000000000031','2025-06-23 20:52:37','Online','IT Vendor','Cloud Security','4','2023-02-20','nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn'),('2a0f1d63-5380-11f0-a786-89d48e4ac80b','2025-06-27 17:57:17','Kingsburry Hotel','Mr. Manahara Dissanayake','How to Use Hybrid Automotive Properly','2 hours','2025-06-28','83eda5b2-bbdd-4b95-99c6-eab3a1b1abf5'),('560adfaa-54df-11f0-a21c-cc5e72225339','2025-06-29 11:51:04','Hilton','sjxnjzkjklj','fhjdxajbsdjbj','10','2025-07-10','43eab6b7-fda2-43e8-a244-6a4b226a20d1');
/*!40000 ALTER TABLE `training` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-01 13:10:03

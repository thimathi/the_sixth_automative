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
-- Table structure for table `employeetraining`
--

DROP TABLE IF EXISTS `employeetraining`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employeetraining` (
  `employeeTrainingId` varchar(36) NOT NULL DEFAULT (uuid()),
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `empId` varchar(36) DEFAULT (uuid()),
  `startTime` datetime DEFAULT NULL,
  `endTime` datetime DEFAULT NULL,
  PRIMARY KEY (`employeeTrainingId`),
  KEY `empId` (`empId`),
  CONSTRAINT `employeetraining_ibfk_1` FOREIGN KEY (`employeeTrainingId`) REFERENCES `training` (`trainingId`),
  CONSTRAINT `employeetraining_ibfk_2` FOREIGN KEY (`empId`) REFERENCES `employee` (`empId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employeetraining`
--

LOCK TABLES `employeetraining` WRITE;
/*!40000 ALTER TABLE `employeetraining` DISABLE KEYS */;
INSERT INTO `employeetraining` VALUES ('00000000-0000-0000-0000-000000000029','2025-06-23 20:52:37','kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk','2023-02-10 09:00:00','2023-02-10 17:00:00'),('00000000-0000-0000-0000-000000000030','2025-06-23 20:52:37','llllllll-llll-llll-llll-llllllllllll','2023-02-15 09:00:00','2023-02-16 17:00:00'),('00000000-0000-0000-0000-000000000031','2025-06-23 20:52:37','nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn','2023-02-20 13:00:00','2023-02-20 17:00:00');
/*!40000 ALTER TABLE `employeetraining` ENABLE KEYS */;
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

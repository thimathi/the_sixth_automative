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
-- Table structure for table `promotion_history`
--

DROP TABLE IF EXISTS `promotion_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promotion_history` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `empId` varchar(36) NOT NULL,
  `previousRole` varchar(100) DEFAULT NULL,
  `newRole` varchar(100) DEFAULT NULL,
  `promotedBy` varchar(36) DEFAULT NULL,
  `promotionDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `empId` (`empId`),
  CONSTRAINT `promotion_history_ibfk_1` FOREIGN KEY (`empId`) REFERENCES `employee` (`empId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promotion_history`
--

LOCK TABLES `promotion_history` WRITE;
/*!40000 ALTER TABLE `promotion_history` DISABLE KEYS */;
INSERT INTO `promotion_history` VALUES ('0a91d332-52c1-11f0-a786-89d48e4ac80b','f0d530a1-544e-4c0a-bfcd-a04773505eab','employee','hr','83eda5b2-bbdd-4b95-99c6-eab3a1b1abf5','2025-06-26 19:09:10'),('a55c434c-52c4-11f0-a786-89d48e4ac80b','f0d530a1-544e-4c0a-bfcd-a04773505eab','employee','hr','83eda5b2-bbdd-4b95-99c6-eab3a1b1abf5','2025-06-26 19:34:58'),('a67dc948-52c4-11f0-a786-89d48e4ac80b','f0d530a1-544e-4c0a-bfcd-a04773505eab','employee','hr','83eda5b2-bbdd-4b95-99c6-eab3a1b1abf5','2025-06-26 19:35:00'),('b3373fae-54a1-11f0-a21c-cc5e72225339','f0d530a1-544e-4c0a-bfcd-a04773505eab','hr','accountant','83eda5b2-bbdd-4b95-99c6-eab3a1b1abf5','2025-06-29 04:29:52');
/*!40000 ALTER TABLE `promotion_history` ENABLE KEYS */;
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

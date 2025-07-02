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
-- Table structure for table `hr_operations`
--

DROP TABLE IF EXISTS `hr_operations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hr_operations` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `operation` varchar(100) NOT NULL,
  `hr_id` varchar(36) NOT NULL,
  `target_employee_id` varchar(36) NOT NULL,
  `details` json DEFAULT NULL,
  `operation_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_hr_operations_hr_id` (`hr_id`),
  KEY `idx_hr_operations_target` (`target_employee_id`),
  KEY `idx_hr_operations_time` (`operation_time`),
  CONSTRAINT `hr_operations_ibfk_1` FOREIGN KEY (`hr_id`) REFERENCES `employee` (`empId`),
  CONSTRAINT `hr_operations_ibfk_2` FOREIGN KEY (`target_employee_id`) REFERENCES `employee` (`empId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hr_operations`
--

LOCK TABLES `hr_operations` WRITE;
/*!40000 ALTER TABLE `hr_operations` DISABLE KEYS */;
INSERT INTO `hr_operations` VALUES ('00000000-0000-0000-0000-000000000088','Onboarding','kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk','pppppppp-pppp-pppp-pppp-pppppppppppp','{\"position\": \"HR Associate\", \"start_date\": \"2022-01-10\"}','2025-06-23 20:54:14'),('00000000-0000-0000-0000-000000000089','Performance Review','kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk','pppppppp-pppp-pppp-pppp-pppppppppppp','{\"rating\": 4.2, \"comments\": \"Exceeds expectations\"}','2025-06-23 20:54:14'),('00000000-0000-0000-0000-000000000090','Leave Adjustment','kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk','pppppppp-pppp-pppp-pppp-pppppppppppp','{\"reason\": \"Service anniversary\", \"adjustment\": \"+2\", \"leave_type\": \"Annual\"}','2025-06-23 20:54:14');
/*!40000 ALTER TABLE `hr_operations` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-01 13:10:02

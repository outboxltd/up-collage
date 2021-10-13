CREATE TABLE `transactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ProductID` int(11) DEFAULT NULL,
  `UserID` int(11) DEFAULT NULL,
  `PurchaseDate` date DEFAULT NULL,
  `Status` enum('WAITING','ACCEPTED') DEFAULT 'WAITING',
  `ChangedStatusDate` date DEFAULT NULL,
  `times` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;

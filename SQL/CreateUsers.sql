CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `FullName` tinytext NOT NULL,
  `OrganizationName` mediumtext NOT NULL,
  `PhoneNumber` varchar(15) NOT NULL,
  `EmailAddress` mediumtext NOT NULL,
  `TeamsAtOrganization` int(11) NOT NULL,
  `GeneralNotes` mediumtext NOT NULL,
  `Password` longtext NOT NULL,
  `IsAdmin` bit(1) NOT NULL DEFAULT b'0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `PhoneNumber` (`PhoneNumber`),
  UNIQUE KEY `key` (`id`),
  UNIQUE KEY `EmailAddress` (`EmailAddress`) USING HASH
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;

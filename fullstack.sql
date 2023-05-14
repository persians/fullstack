-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Värd: 127.0.0.1
-- Tid vid skapande: 14 maj 2023 kl 22:00
-- Serverversion: 10.4.27-MariaDB
-- PHP-version: 8.2.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Databas: `fullstack`
--

-- --------------------------------------------------------

--
-- Tabellstruktur `comment`
--

CREATE TABLE `comment` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `text` varchar(500) NOT NULL,
  `date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabellstruktur `post`
--

CREATE TABLE `post` (
  `id` int(11) NOT NULL,
  `title` varchar(100) NOT NULL,
  `text` text NOT NULL,
  `img` varchar(255) NOT NULL,
  `date` timestamp NOT NULL DEFAULT current_timestamp(),
  `user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumpning av Data i tabell `post`
--

INSERT INTO `post` (`id`, `title`, `text`, `img`, `date`, `user_id`) VALUES
(13, 'Unlikely Love - by cursed', 'Ayub and Mohammed have been best friends since childhood, but as they enter their senior year of high school, Ayub realizes that his feelings for Mohammed are starting to change. He\'s always thought of Mohammed as just a friend, but now he\'s starting to see him in a different light. As Ayub struggles to come to terms with his new feelings, he starts to notice that Mohammed is acting strangely too. He\'s become distant and moody, and Ayub can\'t help but wonder if it\'s because he\'s picked up on Ayub\'s feelings. One day, Ayub musters up the courage to confront Mohammed and tell him how he feels. To his surprise, Mohammed admits that he\'s been struggling with his own feelings for Ayub too. They decide to take things slow and start exploring their new romantic relationship. However, their newfound love is not without its challenges. Ayub comes from a conservative Muslim family, and he\'s not sure how they will react to him being gay. Mohammed also struggles with his own cultural identity and the expectations placed on him by his family. Together, Ayub and Mohammed navigate their way through their first love while dealing with the complexities of their cultural and religious backgrounds. Will their love be enough to overcome the obstacles in their path, or will they be forced to go their separate ways?', '/uploads/1683184913174.png', '2023-05-04 07:21:53', 6),
(18, 'The Paradox of Cuteness: Should We Cancel Ayub Birre Barre?', 'In a world where cancel culture is prevalent, individuals are often subjected to scrutiny for their actions, beliefs, or past behaviors. However, it is essential to question the rationale behind canceling someone solely based on their cuteness factor. This article explores the recent controversial trend of canceling Ayub Birre Barre, an individual whose \"cute\" appearance has sparked a wave of online debate.\r\n\r\nThe Cuteness Paradox:\r\nAyub Birre Barre, a young social media sensation, has captured the hearts of millions with his adorable looks and charismatic personality. His infectious smile and endearing antics have garnered him a substantial following, leading to lucrative brand deals and widespread recognition. However, some individuals argue that his level of cuteness has reached a point where it becomes problematic, prompting discussions about the need to cancel him.\r\n\r\nSupporters of the cancel Ayub Birre Barre movement argue that his excessive cuteness perpetuates unrealistic standards and exacerbates the issue of objectification. They claim that the overwhelming attention given to his appearance diverts focus from his character, abilities, and accomplishments. They contend that this form of adoration reinforces superficiality and places undue pressure on others to conform to unattainable standards of cuteness.\r\n\r\nMoreover, critics argue that the cult-like following surrounding Ayub Birre Barre detracts attention from more important issues. They contend that there are more pressing matters, such as social justice, environmental concerns, or political debates that deserve the spotlight instead. In their view, the obsession with Ayub Birre Barre\'s cuteness reflects a misplaced societal priority, warranting his cancellation as a means to redirect attention to more significant matters.\r\n\r\nWhile the arguments for canceling Ayub Birre Barre have gained traction, there is a counterargument that suggests cuteness should not be a cause for cancellation. Proponents of this viewpoint argue that Ayub Birre Barre\'s cuteness is an innate quality and not something he deliberately uses to manipulate or harm others. They contend that canceling someone based purely on their appearance sets a dangerous precedent and undermines the principles of individual autonomy and freedom.\r\n\r\nFurthermore, Ayub Birre Barre\'s admirers argue that his appeal goes beyond mere physical appearance. They contend that his charisma, talent, and positive influence on others should not be overshadowed by discussions of his cuteness. Supporters maintain that he has used his platform to spread joy, raise awareness for charitable causes, and encourage kindness, making him a positive force in society.\r\n\r\nPromoting a Balanced Approach:\r\nInstead of rushing to cancel Ayub Birre Barre or anyone else based on cuteness alone, it is crucial to adopt a more balanced perspective. While the impact of excessive focus on cuteness is worth discussing, cancelation should be reserved for instances where an individual\'s actions or behavior genuinely harm others or violate ethical principles.\r\n\r\nConclusion:\r\nThe controversy surrounding Ayub Birre Barre\'s cuteness underscores the broader issues of cancel culture and its potential consequences. While it is essential to critique societal norms and values, we must be cautious about canceling individuals based solely on superficial attributes. Instead, let us focus on promoting empathy, understanding, and meaningful discussions to address the challenges we face in a more constructive and inclusive manner.', '/uploads/1684094223361.jpg', '2023-05-14 19:57:03', 1);

-- --------------------------------------------------------

--
-- Tabellstruktur `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `admin` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumpning av Data i tabell `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `admin`) VALUES
(1, 'Artin', 'artin.mirzay@gmail.com', '$2b$10$xxgXBYiN/0nCGoPurX22fO3xUEMd8VUXGzUPBU/ewEYWrlpOUx07.', 1),
(6, 'cursed', 'cursed.pic@gmail.com', '$2b$10$7OtH/BNCoYuTQtxQKYbBneCS/qRYPrnd7MZSOVAkkVJ0wqdfvPzkW', 0);

--
-- Index för dumpade tabeller
--

--
-- Index för tabell `comment`
--
ALTER TABLE `comment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `post_id` (`post_id`);

--
-- Index för tabell `post`
--
ALTER TABLE `post`
  ADD PRIMARY KEY (`id`);

--
-- Index för tabell `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT för dumpade tabeller
--

--
-- AUTO_INCREMENT för tabell `comment`
--
ALTER TABLE `comment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT för tabell `post`
--
ALTER TABLE `post`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT för tabell `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Restriktioner för dumpade tabeller
--

--
-- Restriktioner för tabell `comment`
--
ALTER TABLE `comment`
  ADD CONSTRAINT `comment_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `comment_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `post` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

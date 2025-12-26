--
-- HGM POS System - MySQL Database Schema
-- Version: 2.0.0-PWA
-- Created: 2024-12-25
-- Complete Item Database for Bar, Restaurant & Lodge
--

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

--
-- Database: `hgm_pos`
--

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','cashier') NOT NULL DEFAULT 'cashier',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
-- Default admin user: username=admin, password=admin123
--

INSERT INTO `users` (`username`, `password`, `role`) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- --------------------------------------------------------

--
-- Table structure for table `items`
--

CREATE TABLE IF NOT EXISTS `items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `section` enum('bar','restaurant','lodge') NOT NULL DEFAULT 'bar',
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `stock` int(11) NOT NULL DEFAULT 0,
  `low_stock_alert` int(11) NOT NULL DEFAULT 10,
  `description` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `section` (`section`),
  KEY `category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping comprehensive data for table `items`
--

-- ============================================================
-- BAR SECTION - Alcoholic & Non-Alcoholic Beverages
-- ============================================================

-- BEERS (Local & International)
INSERT INTO `items` (`name`, `category`, `section`, `price`, `stock`, `low_stock_alert`, `description`) VALUES
('Nile Special', 'Beer', 'bar', 3500.00, 120, 30, '500ml bottle - Uganda premium lager'),
('Bell Lager', 'Beer', 'bar', 3500.00, 120, 30, '500ml bottle - Uganda popular beer'),
('Tusker Lager', 'Beer', 'bar', 3500.00, 100, 25, '500ml bottle - Kenya premium lager'),
('Tusker Malt', 'Beer', 'bar', 4000.00, 80, 20, '500ml bottle - Premium malt lager'),
('Pilsner Lager', 'Beer', 'bar', 3000.00, 150, 35, '500ml bottle - Budget friendly'),
('Club Pilsner', 'Beer', 'bar', 3200.00, 100, 25, '500ml bottle - Premium pilsner'),
('Guinness Stout', 'Beer', 'bar', 4500.00, 60, 15, '500ml bottle - Dark Irish stout'),
('Guinness Smooth', 'Beer', 'bar', 4500.00, 60, 15, '500ml bottle - Smooth stout'),
('Heineken', 'Beer', 'bar', 5000.00, 80, 20, '500ml bottle - Imported Dutch lager'),
('Corona Extra', 'Beer', 'bar', 6000.00, 50, 10, '355ml bottle - Mexican premium beer'),
('Carlsberg', 'Beer', 'bar', 4500.00, 70, 18, '500ml bottle - Danish premium lager'),
('Castle Lager', 'Beer', 'bar', 3800.00, 90, 22, '500ml bottle - South African lager'),
('White Cap Lager', 'Beer', 'bar', 3500.00, 100, 25, '500ml bottle - Kenya popular beer'),
('Eagle Lager', 'Beer', 'bar', 3000.00, 120, 30, '500ml bottle - Uganda budget beer'),

-- SPIRITS (Whiskey, Vodka, Gin, Rum, etc.)
('Johnnie Walker Red Label', 'Whiskey', 'bar', 80000.00, 20, 5, '750ml bottle - Blended Scotch whisky'),
('Johnnie Walker Black Label', 'Whiskey', 'bar', 120000.00, 15, 3, '750ml bottle - Premium blended Scotch'),
('Jameson Irish Whiskey', 'Whiskey', 'bar', 90000.00, 18, 4, '750ml bottle - Triple distilled Irish'),
('Jack Daniels', 'Whiskey', 'bar', 110000.00, 12, 3, '750ml bottle - Tennessee whiskey'),
('Grants Whisky', 'Whiskey', 'bar', 65000.00, 25, 6, '750ml bottle - Blended Scotch'),
('Smirnoff Vodka', 'Vodka', 'bar', 50000.00, 30, 8, '750ml bottle - Premium vodka'),
('Absolute Vodka', 'Vodka', 'bar', 70000.00, 20, 5, '750ml bottle - Swedish premium vodka'),
('Skyy Vodka', 'Vodka', 'bar', 55000.00, 25, 6, '750ml bottle - American vodka'),
('Bond 7 Vodka', 'Vodka', 'bar', 40000.00, 35, 8, '750ml bottle - Local vodka'),
('Gilbeys Gin', 'Gin', 'bar', 45000.00, 28, 7, '750ml bottle - London dry gin'),
('Gordons Gin', 'Gin', 'bar', 50000.00, 25, 6, '750ml bottle - Premium London dry'),
('Tanqueray Gin', 'Gin', 'bar', 85000.00, 15, 4, '750ml bottle - Premium imported gin'),
('Captain Morgan Rum', 'Rum', 'bar', 55000.00, 22, 5, '750ml bottle - Spiced rum'),
('Bacardi White Rum', 'Rum', 'bar', 60000.00, 20, 5, '750ml bottle - White rum'),
('Uganda Waragi', 'Gin', 'bar', 25000.00, 40, 10, '750ml bottle - Local gin'),
('Bond 7 Brandy', 'Brandy', 'bar', 40000.00, 30, 7, '750ml bottle - Local brandy'),
('Richot Brandy', 'Brandy', 'bar', 35000.00, 35, 8, '750ml bottle - Budget brandy'),

-- WINES
('4th Street Wine Red', 'Wine', 'bar', 25000.00, 30, 8, '750ml bottle - Sweet red wine'),
('4th Street Wine White', 'Wine', 'bar', 25000.00, 30, 8, '750ml bottle - Sweet white wine'),
('Drostdy Hof Red', 'Wine', 'bar', 30000.00, 25, 6, '750ml bottle - South African red'),
('Drostdy Hof White', 'Wine', 'bar', 30000.00, 25, 6, '750ml bottle - South African white'),
('Nederburg Cabernet', 'Wine', 'bar', 45000.00, 18, 5, '750ml bottle - Premium red wine'),
('Nederburg Chardonnay', 'Wine', 'bar', 45000.00, 18, 5, '750ml bottle - Premium white wine'),
('Rose Wine', 'Wine', 'bar', 28000.00, 22, 6, '750ml bottle - Blush wine'),

-- SOFT DRINKS
('Coca Cola 300ml', 'Soft Drinks', 'bar', 2000.00, 200, 50, 'Glass bottle'),
('Coca Cola 500ml', 'Soft Drinks', 'bar', 2500.00, 200, 50, 'PET bottle'),
('Coca Cola 1.5L', 'Soft Drinks', 'bar', 5000.00, 100, 25, 'Large PET bottle'),
('Pepsi 300ml', 'Soft Drinks', 'bar', 2000.00, 150, 40, 'Glass bottle'),
('Pepsi 500ml', 'Soft Drinks', 'bar', 2500.00, 150, 40, 'PET bottle'),
('Fanta Orange 300ml', 'Soft Drinks', 'bar', 2000.00, 180, 45, 'Glass bottle'),
('Fanta Orange 500ml', 'Soft Drinks', 'bar', 2500.00, 180, 45, 'PET bottle'),
('Sprite 300ml', 'Soft Drinks', 'bar', 2000.00, 180, 45, 'Glass bottle'),
('Sprite 500ml', 'Soft Drinks', 'bar', 2500.00, 180, 45, 'PET bottle'),
('Mountain Dew 500ml', 'Soft Drinks', 'bar', 2500.00, 120, 30, 'PET bottle'),
('Mirinda 300ml', 'Soft Drinks', 'bar', 2000.00, 150, 38, 'Glass bottle'),
('Stoney Tangawizi 300ml', 'Soft Drinks', 'bar', 2000.00, 140, 35, 'Ginger soft drink'),
('Novida 300ml', 'Soft Drinks', 'bar', 1800.00, 160, 40, 'Local soft drink'),

-- JUICES & ENERGY DRINKS
('Minute Maid Mango', 'Juice', 'bar', 3000.00, 100, 25, '350ml bottle'),
('Minute Maid Orange', 'Juice', 'bar', 3000.00, 100, 25, '350ml bottle'),
('Minute Maid Apple', 'Juice', 'bar', 3000.00, 100, 25, '350ml bottle'),
('Rwenzori Water 500ml', 'Water', 'bar', 1500.00, 300, 75, 'Bottled mineral water'),
('Rwenzori Water 1.5L', 'Water', 'bar', 3000.00, 150, 40, 'Large bottled water'),
('Red Bull 250ml', 'Energy Drink', 'bar', 6000.00, 80, 20, 'Energy drink'),
('Monster Energy 500ml', 'Energy Drink', 'bar', 8000.00, 60, 15, 'Large energy drink'),
('Power Horse 250ml', 'Energy Drink', 'bar', 5000.00, 90, 22, 'Energy drink'),

-- MIXERS
('Tonic Water 200ml', 'Mixers', 'bar', 2000.00, 120, 30, 'Schweppes tonic'),
('Soda Water 200ml', 'Mixers', 'bar', 1500.00, 120, 30, 'Schweppes soda'),
('Ginger Ale 200ml', 'Mixers', 'bar', 2000.00, 100, 25, 'Schweppes ginger'),

-- ============================================================
-- RESTAURANT SECTION - Food & Beverages
-- ============================================================

-- BREAKFAST
('Full English Breakfast', 'Breakfast', 'restaurant', 18000.00, 50, 10, 'Eggs, sausage, bacon, beans, toast'),
('Continental Breakfast', 'Breakfast', 'restaurant', 12000.00, 50, 10, 'Croissant, jam, butter, coffee'),
('Omelette Plain', 'Breakfast', 'restaurant', 8000.00, 80, 15, '3-egg omelette'),
('Omelette Spanish', 'Breakfast', 'restaurant', 12000.00, 70, 15, 'With peppers, onions, tomatoes'),
('Scrambled Eggs', 'Breakfast', 'restaurant', 8000.00, 80, 15, '3 eggs with toast'),
('Boiled Eggs (2)', 'Breakfast', 'restaurant', 5000.00, 100, 20, 'Hard or soft boiled'),
('Pancakes (3)', 'Breakfast', 'restaurant', 10000.00, 60, 12, 'With maple syrup'),
('French Toast', 'Breakfast', 'restaurant', 9000.00, 60, 12, 'With cinnamon sugar'),
('Kikomando', 'Breakfast', 'restaurant', 5000.00, 100, 20, 'Beans and chapati'),
('Katogo Matooke', 'Breakfast', 'restaurant', 8000.00, 80, 15, 'Traditional Ugandan breakfast'),
('Porridge', 'Breakfast', 'restaurant', 4000.00, 120, 25, 'Millet or maize porridge'),

-- APPETIZERS & STARTERS
('Chicken Wings (6pcs)', 'Appetizers', 'restaurant', 15000.00, 80, 15, 'BBQ or hot sauce'),
('Chicken Wings (12pcs)', 'Appetizers', 'restaurant', 25000.00, 60, 12, 'BBQ or hot sauce'),
('Spring Rolls (4pcs)', 'Appetizers', 'restaurant', 8000.00, 100, 20, 'Vegetable spring rolls'),
('Samosas (3pcs)', 'Appetizers', 'restaurant', 5000.00, 120, 25, 'Beef or vegetable'),
('Goat Muchomo (4pcs)', 'Appetizers', 'restaurant', 12000.00, 70, 15, 'Grilled goat skewers'),
('Beef Muchomo (4pcs)', 'Appetizers', 'restaurant', 10000.00, 80, 16, 'Grilled beef skewers'),
('Chicken Muchomo (4pcs)', 'Appetizers', 'restaurant', 8000.00, 90, 18, 'Grilled chicken skewers'),
('Fried Cassava', 'Appetizers', 'restaurant', 5000.00, 100, 20, 'Crispy fried cassava'),
('Soup of the Day', 'Appetizers', 'restaurant', 6000.00, 80, 15, 'Ask for todays special'),

-- MAIN COURSES - CHICKEN
('Fried Chicken & Chips', 'Main Course', 'restaurant', 15000.00, 100, 20, 'Quarter chicken with chips'),
('Grilled Chicken & Chips', 'Main Course', 'restaurant', 18000.00, 90, 18, 'Quarter grilled chicken'),
('Roast Chicken & Chips', 'Main Course', 'restaurant', 20000.00, 80, 16, 'Quarter roasted chicken'),
('Chicken Burger & Chips', 'Main Course', 'restaurant', 12000.00, 100, 20, 'Chicken patty burger'),
('Chicken Stew & Rice', 'Main Course', 'restaurant', 15000.00, 90, 18, 'Traditional chicken stew'),
('Chicken Curry & Rice', 'Main Course', 'restaurant', 16000.00, 80, 16, 'Spicy chicken curry'),
('Chicken Biryani', 'Main Course', 'restaurant', 18000.00, 70, 14, 'Spiced rice with chicken'),

-- MAIN COURSES - BEEF
('Beef Stew & Rice', 'Main Course', 'restaurant', 18000.00, 80, 16, 'Traditional beef stew'),
('Beef Curry & Rice', 'Main Course', 'restaurant', 20000.00, 70, 14, 'Spicy beef curry'),
('Beef Burger & Chips', 'Main Course', 'restaurant', 14000.00, 100, 20, 'Beef patty burger'),
('Steak & Chips', 'Main Course', 'restaurant', 35000.00, 50, 10, 'Sirloin steak grilled'),
('Beef Pilau', 'Main Course', 'restaurant', 18000.00, 80, 16, 'Spiced rice with beef'),

-- MAIN COURSES - FISH
('Fried Fish & Chips', 'Main Course', 'restaurant', 18000.00, 80, 16, 'Whole tilapia fried'),
('Grilled Fish & Chips', 'Main Course', 'restaurant', 20000.00, 70, 14, 'Whole tilapia grilled'),
('Fish Fillet & Chips', 'Main Course', 'restaurant', 22000.00, 60, 12, 'Boneless fish fillet'),
('Fish Stew & Rice', 'Main Course', 'restaurant', 20000.00, 70, 14, 'Traditional fish stew'),

-- MAIN COURSES - PORK
('Pork Chops & Chips', 'Main Course', 'restaurant', 20000.00, 60, 12, 'Grilled pork chops'),
('Pork Ribs & Chips', 'Main Course', 'restaurant', 25000.00, 50, 10, 'BBQ pork ribs'),

-- MAIN COURSES - GOAT
('Goat Stew & Rice', 'Main Course', 'restaurant', 22000.00, 60, 12, 'Traditional goat stew'),
('Goat Curry & Rice', 'Main Course', 'restaurant', 24000.00, 55, 11, 'Spicy goat curry'),

-- VEGETARIAN
('Vegetable Fried Rice', 'Vegetarian', 'restaurant', 12000.00, 100, 20, 'Mixed vegetables with rice'),
('Vegetable Curry', 'Vegetarian', 'restaurant', 10000.00, 100, 20, 'Mixed vegetable curry'),
('Vegetable Burger & Chips', 'Vegetarian', 'restaurant', 10000.00, 80, 16, 'Veggie patty burger'),

-- UGANDAN TRADITIONAL
('Matooke & Beef', 'Traditional', 'restaurant', 15000.00, 90, 18, 'Steamed banana with beef'),
('Matooke & Chicken', 'Traditional', 'restaurant', 14000.00, 90, 18, 'Steamed banana with chicken'),
('Matooke & Fish', 'Traditional', 'restaurant', 16000.00, 80, 16, 'Steamed banana with fish'),
('Matooke & Groundnut Sauce', 'Traditional', 'restaurant', 12000.00, 100, 20, 'Vegetarian option'),
('Posho & Beans', 'Traditional', 'restaurant', 6000.00, 150, 30, 'Maize meal with beans'),
('Sweet Potatoes & Beans', 'Traditional', 'restaurant', 7000.00, 120, 24, 'Traditional meal'),
('Cassava & Beans', 'Traditional', 'restaurant', 7000.00, 120, 24, 'Traditional meal'),

-- FAST FOOD / SNACKS
('Rolex (Egg)', 'Snacks', 'restaurant', 5000.00, 150, 30, 'Chapati with egg'),
('Rolex (Egg & Sausage)', 'Snacks', 'restaurant', 7000.00, 120, 24, 'Chapati with egg and sausage'),
('Samosa (1pc)', 'Snacks', 'restaurant', 2000.00, 200, 40, 'Beef or vegetable'),
('Chapati (Plain)', 'Snacks', 'restaurant', 2000.00, 180, 36, 'Wheat chapati'),
('Mandazi (3pcs)', 'Snacks', 'restaurant', 3000.00, 150, 30, 'Fried dough'),
('Meat Pie', 'Snacks', 'restaurant', 4000.00, 100, 20, 'Beef or chicken'),
('Sausage Roll', 'Snacks', 'restaurant', 3500.00, 120, 24, 'Puff pastry with sausage'),
('Chips (Small)', 'Snacks', 'restaurant', 5000.00, 200, 40, 'French fries'),
('Chips (Medium)', 'Snacks', 'restaurant', 8000.00, 180, 36, 'French fries'),
('Chips (Large)', 'Snacks', 'restaurant', 12000.00, 150, 30, 'French fries'),

-- SIDE DISHES
('Rice (Plain)', 'Sides', 'restaurant', 5000.00, 200, 40, 'Steamed white rice'),
('Fried Rice', 'Sides', 'restaurant', 8000.00, 150, 30, 'Stir-fried rice'),
('Pilau Rice', 'Sides', 'restaurant', 10000.00, 120, 24, 'Spiced rice'),
('Matoke (Plain)', 'Sides', 'restaurant', 6000.00, 150, 30, 'Steamed banana'),
('Posho', 'Sides', 'restaurant', 3000.00, 200, 40, 'Maize meal'),
('Irish Potatoes', 'Sides', 'restaurant', 5000.00, 150, 30, 'Boiled or mashed'),
('Sweet Potatoes', 'Sides', 'restaurant', 4000.00, 150, 30, 'Boiled'),
('Cassava', 'Sides', 'restaurant', 4000.00, 140, 28, 'Boiled cassava'),
('Salad (Green)', 'Sides', 'restaurant', 5000.00, 100, 20, 'Fresh garden salad'),
('Coleslaw', 'Sides', 'restaurant', 5000.00, 100, 20, 'Cabbage salad'),

-- DESSERTS
('Fruit Salad', 'Desserts', 'restaurant', 8000.00, 60, 12, 'Mixed fresh fruits'),
('Ice Cream (Single Scoop)', 'Desserts', 'restaurant', 5000.00, 100, 20, 'Vanilla, chocolate, strawberry'),
('Ice Cream (Double Scoop)', 'Desserts', 'restaurant', 8000.00, 80, 16, 'Choice of flavors'),
('Chocolate Cake (Slice)', 'Desserts', 'restaurant', 8000.00, 50, 10, 'Rich chocolate cake'),
('Vanilla Cake (Slice)', 'Desserts', 'restaurant', 7000.00, 50, 10, 'Classic vanilla cake'),
('Doughnut', 'Desserts', 'restaurant', 3000.00, 100, 20, 'Glazed doughnut'),

-- HOT BEVERAGES
('Coffee (Black)', 'Hot Beverages', 'restaurant', 3000.00, 200, 40, 'Freshly brewed'),
('Coffee (White)', 'Hot Beverages', 'restaurant', 3500.00, 200, 40, 'With milk'),
('Cappuccino', 'Hot Beverages', 'restaurant', 6000.00, 150, 30, 'Espresso with foam'),
('Latte', 'Hot Beverages', 'restaurant', 6000.00, 150, 30, 'Espresso with milk'),
('Espresso (Single)', 'Hot Beverages', 'restaurant', 4000.00, 180, 36, 'Short black coffee'),
('Espresso (Double)', 'Hot Beverages', 'restaurant', 6000.00, 160, 32, 'Double shot'),
('Tea (Black)', 'Hot Beverages', 'restaurant', 2500.00, 200, 40, 'Black tea'),
('Tea (Milk)', 'Hot Beverages', 'restaurant', 3000.00, 200, 40, 'Tea with milk'),
('Herbal Tea', 'Hot Beverages', 'restaurant', 4000.00, 150, 30, 'Various flavors'),
('Hot Chocolate', 'Hot Beverages', 'restaurant', 5000.00, 120, 24, 'Rich hot chocolate'),
('African Tea', 'Hot Beverages', 'restaurant', 3000.00, 180, 36, 'Spiced milk tea'),

-- ============================================================
-- LODGE SECTION - Accommodation & Services
-- ============================================================

-- ROOM ACCOMMODATION
('Single Room (Standard)', 'Accommodation', 'lodge', 50000.00, 10, 2, 'One night - Single bed, ensuite bathroom, TV, WiFi'),
('Single Room (Deluxe)', 'Accommodation', 'lodge', 70000.00, 8, 2, 'One night - Premium single room with balcony'),
('Double Room (Standard)', 'Accommodation', 'lodge', 75000.00, 12, 3, 'One night - Double bed, ensuite bathroom, TV, WiFi'),
('Double Room (Deluxe)', 'Accommodation', 'lodge', 95000.00, 10, 2, 'One night - Premium double with balcony and lake view'),
('Twin Room (Standard)', 'Accommodation', 'lodge', 80000.00, 10, 2, 'One night - Two single beds, ensuite bathroom'),
('Twin Room (Deluxe)', 'Accommodation', 'lodge', 100000.00, 8, 2, 'One night - Premium twin room with balcony'),
('Family Room', 'Accommodation', 'lodge', 120000.00, 6, 2, 'One night - Sleeps 4, two double beds'),
('Executive Suite', 'Accommodation', 'lodge', 150000.00, 5, 1, 'One night - Separate living area, king bed, premium amenities'),
('Presidential Suite', 'Accommodation', 'lodge', 250000.00, 2, 1, 'One night - Luxury suite, jacuzzi, dining area, butler service'),

-- SHORT STAY ROOMS
('Short Stay (3 Hours)', 'Short Stay', 'lodge', 30000.00, 8, 2, 'Quick rest - Standard room for 3 hours'),
('Short Stay (6 Hours)', 'Short Stay', 'lodge', 40000.00, 8, 2, 'Half day - Standard room for 6 hours'),

-- CONFERENCE & MEETING
('Conference Room (Half Day)', 'Conference', 'lodge', 200000.00, 3, 1, 'Meeting room for 20 people, 4 hours, projector, WiFi'),
('Conference Room (Full Day)', 'Conference', 'lodge', 350000.00, 3, 1, 'Meeting room for 20 people, 8 hours, equipment included'),
('Boardroom (Half Day)', 'Conference', 'lodge', 150000.00, 2, 1, 'Small meeting room for 10 people, 4 hours'),
('Boardroom (Full Day)', 'Conference', 'lodge', 250000.00, 2, 1, 'Small meeting room for 10 people, 8 hours'),

-- EXTRA SERVICES
('Extra Bed', 'Services', 'lodge', 20000.00, 15, 3, 'Additional bed in room'),
('Breakfast (Continental)', 'Services', 'lodge', 15000.00, 100, 20, 'Per person - Continental breakfast'),
('Breakfast (Full English)', 'Services', 'lodge', 20000.00, 80, 16, 'Per person - Full English breakfast'),
('Airport Pickup', 'Services', 'lodge', 50000.00, 10, 2, 'One way transfer from Entebbe Airport'),
('Airport Drop-off', 'Services', 'lodge', 50000.00, 10, 2, 'One way transfer to Entebbe Airport'),
('Laundry Service (Per Item)', 'Services', 'lodge', 5000.00, 200, 40, 'Wash, dry and iron'),
('Iron & Press (Per Item)', 'Services', 'lodge', 2000.00, 200, 40, 'Pressing service only'),
('Room Service Delivery', 'Services', 'lodge', 3000.00, 100, 20, 'Food delivery to room charge'),

-- ENTERTAINMENT & RECREATION
('Swimming Pool Day Pass', 'Recreation', 'lodge', 20000.00, 50, 10, 'Full day pool access'),
('Gym Day Pass', 'Recreation', 'lodge', 15000.00, 30, 6, 'Full day gym access'),
('Sauna Session (1 Hour)', 'Recreation', 'lodge', 25000.00, 20, 4, 'Steam sauna session'),
('Massage (1 Hour)', 'Recreation', 'lodge', 50000.00, 15, 3, 'Professional massage therapy'),
('Karaoke Room (Per Hour)', 'Recreation', 'lodge', 30000.00, 5, 1, 'Private karaoke room rental');

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE IF NOT EXISTS `transactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cashier_id` int(11) NOT NULL,
  `total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `payment_method` enum('cash','card','mobile_money') NOT NULL DEFAULT 'cash',
  `section` enum('bar','restaurant','lodge') NOT NULL DEFAULT 'bar',
  `customer_name` varchar(200) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `cashier_id` (`cashier_id`),
  KEY `created_at` (`created_at`),
  KEY `section` (`section`),
  CONSTRAINT `fk_transactions_cashier` FOREIGN KEY (`cashier_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transaction_items`
--

CREATE TABLE IF NOT EXISTS `transaction_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `transaction_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`),
  KEY `transaction_id` (`transaction_id`),
  KEY `item_id` (`item_id`),
  CONSTRAINT `fk_transaction_items_transaction` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_transaction_items_item` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `business_settings`
--

CREATE TABLE IF NOT EXISTS `business_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_name` varchar(200) NOT NULL DEFAULT 'HGM Properties Ltd',
  `phone` varchar(50) DEFAULT '+256-XXX-XXXXXX',
  `email` varchar(100) DEFAULT 'info@hgmproperties.com',
  `address` varchar(255) DEFAULT 'Kampala, Uganda',
  `footer_message` text DEFAULT 'Thank you for your business!\nPlease visit us again',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `business_settings`
--

INSERT INTO `business_settings` (`id`, `business_name`, `phone`, `email`, `address`, `footer_message`) VALUES
(1, 'HGM Properties Ltd', '+256-XXX-XXXXXX', 'info@hgmproperties.com', 'Kampala, Uganda', 'Thank you for your business!\nPlease visit us again');

-- --------------------------------------------------------

--
-- Indexes and Auto Increment values
--

ALTER TABLE `users` AUTO_INCREMENT = 2;
ALTER TABLE `items` AUTO_INCREMENT = 201;
ALTER TABLE `transactions` AUTO_INCREMENT = 1;
ALTER TABLE `transaction_items` AUTO_INCREMENT = 1;
ALTER TABLE `business_settings` AUTO_INCREMENT = 2;

COMMIT;

-- ============================================================================
-- KrishiMitra Product Seed Data
-- Run this in Supabase SQL Editor AFTER clearing existing products
-- ============================================================================

-- Step 1: Clear all existing products and related orders
DELETE FROM public.orders;
DELETE FROM public.products;

-- Step 2: Create a demo farmer profile (if not exists)
-- You'll need to replace this UUID with an actual farmer's user ID from your system
-- For now, we use a placeholder that you can update
DO $$
DECLARE
  farmer_id uuid;
BEGIN
  -- Try to find an existing farmer
  SELECT id INTO farmer_id FROM public.profiles WHERE role = 'farmer' LIMIT 1;
  
  -- If no farmer exists, we'll use a placeholder note
  IF farmer_id IS NULL THEN
    RAISE NOTICE 'No farmer found. Please create a farmer account first, then run the INSERT statements below with the correct farmer_id.';
    RETURN;
  END IF;

  -- ============================================================================
  -- NICHE 1: VEGETABLES (5 products)
  -- ============================================================================
  INSERT INTO public.products (farmer_id, name, description, price_per_kg, quantity_kg, category, location, is_available) VALUES
  (farmer_id, 'Fresh Tomatoes', 'Organically grown red tomatoes, perfect for cooking and salads. Harvested daily for maximum freshness.', 35, 200, 'Vegetables', 'Nashik, Maharashtra', true),
  (farmer_id, 'Green Spinach (Palak)', 'Farm-fresh spinach leaves, rich in iron and vitamins. Ideal for palak paneer and smoothies.', 25, 150, 'Vegetables', 'Pune, Maharashtra', true),
  (farmer_id, 'Red Onions', 'Premium quality red onions, stored in cool conditions. Long shelf life and great taste.', 28, 500, 'Vegetables', 'Nashik, Maharashtra', true),
  (farmer_id, 'Fresh Potatoes', 'Clean, medium-sized potatoes perfect for all Indian dishes. No chemical treatment.', 22, 800, 'Vegetables', 'Agra, Uttar Pradesh', true),
  (farmer_id, 'Lady Finger (Bhindi)', 'Tender and fresh okra, organically grown. Perfect for bhindi masala and fry.', 40, 100, 'Vegetables', 'Indore, Madhya Pradesh', true);

  -- ============================================================================
  -- NICHE 2: FRUITS (5 products)
  -- ============================================================================
  INSERT INTO public.products (farmer_id, name, description, price_per_kg, quantity_kg, category, location, is_available) VALUES
  (farmer_id, 'Alphonso Mangoes', 'Premium Ratnagiri Alphonso mangoes. Sweet, aromatic, and naturally ripened on the tree.', 250, 50, 'Fruits', 'Ratnagiri, Maharashtra', true),
  (farmer_id, 'Fresh Bananas (Cavendish)', 'Naturally ripened bananas, rich in potassium. Sold in bunches of 12.', 45, 300, 'Fruits', 'Jalgaon, Maharashtra', true),
  (farmer_id, 'Pomegranate (Anar)', 'Juicy Bhagwa variety pomegranates. Deep red seeds with sweet-tart flavor.', 120, 80, 'Fruits', 'Solapur, Maharashtra', true),
  (farmer_id, 'Sweet Lime (Mosambi)', 'Fresh and juicy mosambi, excellent for juice. High vitamin C content.', 55, 200, 'Fruits', 'Nagpur, Maharashtra', true),
  (farmer_id, 'Guava (Amrood)', 'Allahabad variety guavas, white flesh, extremely aromatic and sweet.', 60, 120, 'Fruits', 'Allahabad, Uttar Pradesh', true);

  -- ============================================================================
  -- NICHE 3: GRAINS & PULSES (5 products)
  -- ============================================================================
  INSERT INTO public.products (farmer_id, name, description, price_per_kg, quantity_kg, category, location, is_available) VALUES
  (farmer_id, 'Organic Wheat (Gehun)', 'Lok-1 variety wheat, stone-ground quality. Perfect for making fresh chapatis.', 32, 1000, 'Grains', 'Indore, Madhya Pradesh', true),
  (farmer_id, 'Basmati Rice (1121)', 'Extra-long grain basmati rice. Aged for 1 year for best aroma and taste.', 85, 500, 'Grains', 'Karnal, Haryana', true),
  (farmer_id, 'Toor Dal (Arhar)', 'Premium quality split pigeon peas. Clean, polished, and ready to cook.', 110, 300, 'Grains', 'Latur, Maharashtra', true),
  (farmer_id, 'Moong Dal (Split)', 'Yellow moong dal, high protein content. Cooks quickly and tastes great.', 95, 250, 'Grains', 'Rajkot, Gujarat', true),
  (farmer_id, 'Jowar (Sorghum)', 'Organic jowar millet, gluten-free and nutritious. Ideal for bhakri and porridge.', 38, 400, 'Grains', 'Solapur, Maharashtra', true);

  -- ============================================================================
  -- NICHE 4: DAIRY PRODUCTS (5 products)
  -- ============================================================================
  INSERT INTO public.products (farmer_id, name, description, price_per_kg, quantity_kg, category, location, is_available) VALUES
  (farmer_id, 'Fresh Cow Milk (A2)', 'Pure A2 cow milk from Gir cows. Delivered within 4 hours of milking.', 70, 50, 'Dairy', 'Anand, Gujarat', true),
  (farmer_id, 'Homemade Ghee (Desi)', 'Traditional bilona method ghee from cow milk. Rich golden color and aroma.', 650, 20, 'Dairy', 'Amravati, Maharashtra', true),
  (farmer_id, 'Fresh Paneer', 'Soft and fresh cottage cheese made from full-cream milk. No preservatives.', 320, 30, 'Dairy', 'Pune, Maharashtra', true),
  (farmer_id, 'Curd (Dahi)', 'Thick, creamy homemade curd set in clay pots. Probiotic-rich and fresh daily.', 55, 40, 'Dairy', 'Kolhapur, Maharashtra', true),
  (farmer_id, 'Buffalo Milk', 'Rich and creamy buffalo milk, high fat content. Perfect for sweets and tea.', 60, 80, 'Dairy', 'Mehsana, Gujarat', true);

  -- ============================================================================
  -- NICHE 5: SPICES (5 products)
  -- ============================================================================
  INSERT INTO public.products (farmer_id, name, description, price_per_kg, quantity_kg, category, location, is_available) VALUES
  (farmer_id, 'Turmeric Powder (Haldi)', 'High-curcumin Lakadong turmeric, sun-dried and stone-ground. Deep yellow color.', 180, 100, 'Spices', 'Sangli, Maharashtra', true),
  (farmer_id, 'Red Chilli Powder', 'Byadgi variety chilli powder, rich red color with moderate heat. No added color.', 220, 80, 'Spices', 'Guntur, Andhra Pradesh', true),
  (farmer_id, 'Cumin Seeds (Jeera)', 'Premium quality whole cumin seeds, highly aromatic. Hand-cleaned and sorted.', 350, 50, 'Spices', 'Unjha, Gujarat', true),
  (farmer_id, 'Coriander Powder (Dhaniya)', 'Freshly ground coriander from whole seeds. Fragrant and essential for curries.', 140, 70, 'Spices', 'Rajkot, Gujarat', true),
  (farmer_id, 'Black Pepper (Kali Mirch)', 'Malabar black pepper, bold size. Sun-dried for maximum pungency and aroma.', 650, 30, 'Spices', 'Wayanad, Kerala', true);

  -- ============================================================================
  -- NICHE 6: SEEDS & ORGANIC (5 products)
  -- ============================================================================
  INSERT INTO public.products (farmer_id, name, description, price_per_kg, quantity_kg, category, location, is_available) VALUES
  (farmer_id, 'Organic Jaggery (Gur)', 'Chemical-free sugarcane jaggery. Dark brown, rich in iron and minerals.', 80, 200, 'Seeds', 'Kolhapur, Maharashtra', true),
  (farmer_id, 'Flax Seeds (Alsi)', 'Omega-3 rich flax seeds, raw and unprocessed. Great for smoothies and ladoos.', 180, 50, 'Seeds', 'Raipur, Chhattisgarh', true),
  (farmer_id, 'Organic Honey', 'Raw, unfiltered multi-flora honey. Collected from forest apiaries. No heating.', 450, 25, 'Seeds', 'Mahabaleshwar, Maharashtra', true),
  (farmer_id, 'Groundnut (Peanuts)', 'Bold variety raw groundnuts, hand-picked. High oil content and great taste.', 95, 300, 'Seeds', 'Junagadh, Gujarat', true),
  (farmer_id, 'Vermicompost Fertilizer', 'Premium quality vermicompost for organic farming. Rich in nutrients and microbes.', 12, 1000, 'Seeds', 'Wardha, Maharashtra', true);

END $$;

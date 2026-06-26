/**
 * Sample products for demo/fallback when database is empty.
 * 30 products across 6 niches with verified Unsplash images that MATCH the product.
 */

export const sampleProducts = [
  // ─── VEGETABLES (5) ───────────────────────────────────────────────
  { id: 'sample-v1', name: 'Fresh Tomatoes', description: 'Organically grown red tomatoes, perfect for cooking and salads.', price_per_kg: 35, quantity_kg: 200, category: 'Vegetables', location: 'Nashik, Maharashtra', is_available: true, farmer_id: 'demo-farmer', image_url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=300&fit=crop' },
  { id: 'sample-v2', name: 'Green Spinach (Palak)', description: 'Farm-fresh spinach leaves, rich in iron and vitamins.', price_per_kg: 25, quantity_kg: 150, category: 'Vegetables', location: 'Pune, Maharashtra', is_available: true, farmer_id: 'demo-farmer', image_url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=300&fit=crop' },
  { id: 'sample-v3', name: 'Red Onions', description: 'Premium quality red onions with long shelf life.', price_per_kg: 28, quantity_kg: 500, category: 'Vegetables', location: 'Nashik, Maharashtra', is_available: true, farmer_id: 'demo-farmer', image_url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&h=300&fit=crop' },
  { id: 'sample-v4', name: 'Fresh Potatoes', description: 'Clean, medium-sized potatoes for all Indian dishes.', price_per_kg: 22, quantity_kg: 800, category: 'Vegetables', location: 'Agra, Uttar Pradesh', is_available: true, farmer_id: 'demo-farmer', image_url: 'https://images.unsplash.com/photo-1518977676601-b53f82aca5d2?w=400&h=300&fit=crop' },
  { id: 'sample-v5', name: 'Lady Finger (Bhindi)', description: 'Tender and fresh okra, organically grown.', price_per_kg: 40, quantity_kg: 100, category: 'Vegetables', location: 'Indore, Madhya Pradesh', is_available: true, farmer_id: 'demo-farmer', image_url: 'https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?w=400&h=300&fit=crop' },

  // ─── FRUITS (5) ───────────────────────────────────────────────────
  { id: 'sample-f1', name: 'Alphonso Mangoes', description: 'Premium Ratnagiri Alphonso, sweet and aromatic.', price_per_kg: 250, quantity_kg: 50, category: 'Fruits', location: 'Ratnagiri, Maharashtra', is_available: true, farmer_id: 'demo-farmer', image_url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&h=300&fit=crop' },
  { id: 'sample-f2', name: 'Fresh Bananas', description: 'Naturally ripened Cavendish bananas, rich in potassium.', price_per_kg: 45, quantity_kg: 300, category: 'Fruits', location: 'Jalgaon, Maharashtra', is_available: true, farmer_id: 'demo-farmer', image_url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop' },
  { id: 'sample-f3', name: 'Pomegranate (Anar)', description: 'Juicy Bhagwa variety, deep red seeds.', price_per_kg: 120, quantity_kg: 80, category: 'Fruits', location: 'Solapur, Maharashtra', is_available: true, farmer_id: 'demo-farmer', image_url: 'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?w=400&h=300&fit=crop' },
  { id: 'sample-f4', name: 'Sweet Lime (Mosambi)', description: 'Fresh and juicy, excellent for juice.', price_per_kg: 55, quantity_kg: 200, category: 'Fruits', location: 'Nagpur, Maharashtra', is_available: true, farmer_id: 'demo-farmer', image_url: 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=400&h=300&fit=crop' },
  { id: 'sample-f5', name: 'Guava (Amrood)', description: 'Allahabad variety, white flesh, sweet and aromatic.', price_per_kg: 60, quantity_kg: 120, category: 'Fruits', location: 'Allahabad, UP', is_available: true, farmer_id: 'demo-farmer', image_url: 'https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?w=400&h=300&fit=crop' },

  // ─── GRAINS & PULSES (5) ──────────────────────────────────────────
  { id: 'sample-g1', name: 'Organic Wheat (Gehun)', description: 'Lok-1 variety wheat, perfect for fresh chapatis.', price_per_kg: 32, quantity_kg: 1000, category: 'Grains', location: 'Indore, Madhya Pradesh', is_available: true, farmer_id: 'demo-farmer', image_url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop' },
  { id: 'sample-g2', name: 'Basmati Rice (1121)', description: 'Extra-long grain basmati, aged 1 year.', price_per_kg: 85, quantity_kg: 500, category: 'Grains', location: 'Karnal, Haryana', is_available: true, farmer_id: 'demo-farmer', image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop' },
  { id: 'sample-g3', name: 'Toor Dal (Arhar)', description: 'Premium split pigeon peas, clean and polished.', price_per_kg: 110, quantity_kg: 300, category: 'Grains', location: 'Latur, Maharashtra', is_available: true, farmer_id: 'demo-farmer', image_url: 'https://images.unsplash.com/photo-1585650450381-7b0c21d7322f?w=400&h=300&fit=crop' },
  { id: 'sample-g4', name: 'Moong Dal (Split)', description: 'Yellow moong dal, high protein, cooks quickly.', price_per_kg: 95, quantity_kg: 250, category: 'Grains', location: 'Rajkot, Gujarat', is_available: true, farmer_id: 'demo-farmer', image_url: 'https://images.unsplash.com/photo-1613743983303-b3e89f8a2b80?w=400&h=300&fit=crop' },
  { id: 'sample-g5', name: 'Jowar (Sorghum)', description: 'Organic millet, gluten-free and nutritious.', price_per_kg: 38, quantity_kg: 400, category: 'Grains', location: 'Solapur, Maharashtra', is_available: true, farmer_id: 'demo-farmer', image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop&crop=bottom' },

  // ─── DAIRY (5) ────────────────────────────────────────────────────
  { id: 'sample-d1', name: 'Fresh Cow Milk (A2)', description: 'Pure A2 Gir cow milk, delivered within 4 hours.', price_per_kg: 70, quantity_kg: 50, category: 'Dairy', location: 'Anand, Gujarat', is_available: true, farmer_id: 'demo-farmer', image_url: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=300&fit=crop' },
  { id: 'sample-d2', name: 'Homemade Ghee (Desi)', description: 'Traditional bilona method ghee, golden and aromatic.', price_per_kg: 650, quantity_kg: 20, category: 'Dairy', location: 'Amravati, Maharashtra', is_available: true, farmer_id: 'demo-farmer', image_url: 'https://images.unsplash.com/photo-1600398142498-be7a3bade8ce?w=400&h=300&fit=crop' },
  { id: 'sample-d3', name: 'Fresh Paneer', description: 'Soft cottage cheese, no preservatives.', price_per_kg: 320, quantity_kg: 30, category: 'Dairy', location: 'Pune, Maharashtra', is_available: true, farmer_id: 'demo-farmer', image_url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=300&fit=crop' },
  { id: 'sample-d4', name: 'Curd (Dahi)', description: 'Thick creamy curd set in clay pots, probiotic-rich.', price_per_kg: 55, quantity_kg: 40, category: 'Dairy', location: 'Kolhapur, Maharashtra', is_available: true, farmer_id: 'demo-farmer', image_url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop' },
  { id: 'sample-d5', name: 'Buffalo Milk', description: 'Rich and creamy, high fat content for sweets and tea.', price_per_kg: 60, quantity_kg: 80, category: 'Dairy', location: 'Mehsana, Gujarat', is_available: true, farmer_id: 'demo-farmer', image_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=300&fit=crop' },

  // ─── SPICES (5) ───────────────────────────────────────────────────
  { id: 'sample-s1', name: 'Turmeric Powder (Haldi)', description: 'High-curcumin Lakadong turmeric, stone-ground.', price_per_kg: 180, quantity_kg: 100, category: 'Spices', location: 'Sangli, Maharashtra', is_available: true, farmer_id: 'demo-farmer', image_url: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400&h=300&fit=crop' },
  { id: 'sample-s2', name: 'Red Chilli Powder', description: 'Byadgi variety, rich red color, moderate heat.', price_per_kg: 220, quantity_kg: 80, category: 'Spices', location: 'Guntur, Andhra Pradesh', is_available: true, farmer_id: 'demo-farmer', image_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=300&fit=crop' },
  { id: 'sample-s3', name: 'Cumin Seeds (Jeera)', description: 'Premium whole cumin seeds, highly aromatic.', price_per_kg: 350, quantity_kg: 50, category: 'Spices', location: 'Unjha, Gujarat', is_available: true, farmer_id: 'demo-farmer', image_url: 'https://images.unsplash.com/photo-1607672632458-9eb56696346a?w=400&h=300&fit=crop' },
  { id: 'sample-s4', name: 'Coriander Powder', description: 'Freshly ground from whole seeds, fragrant.', price_per_kg: 140, quantity_kg: 70, category: 'Spices', location: 'Rajkot, Gujarat', is_available: true, farmer_id: 'demo-farmer', image_url: 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=400&h=300&fit=crop' },
  { id: 'sample-s5', name: 'Black Pepper (Kali Mirch)', description: 'Malabar black pepper, bold and pungent.', price_per_kg: 650, quantity_kg: 30, category: 'Spices', location: 'Wayanad, Kerala', is_available: true, farmer_id: 'demo-farmer', image_url: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=400&h=300&fit=crop' },

  // ─── SEEDS & ORGANIC (5) ──────────────────────────────────────────
  { id: 'sample-o1', name: 'Organic Jaggery (Gur)', description: 'Chemical-free sugarcane jaggery, rich in iron.', price_per_kg: 80, quantity_kg: 200, category: 'Seeds', location: 'Kolhapur, Maharashtra', is_available: true, farmer_id: 'demo-farmer', image_url: 'https://images.unsplash.com/photo-1605197161470-5f3e9b445c6f?w=400&h=300&fit=crop' },
  { id: 'sample-o2', name: 'Flax Seeds (Alsi)', description: 'Omega-3 rich, raw and unprocessed.', price_per_kg: 180, quantity_kg: 50, category: 'Seeds', location: 'Raipur, Chhattisgarh', is_available: true, farmer_id: 'demo-farmer', image_url: 'https://images.unsplash.com/photo-1612187209234-a68b2e07c8e3?w=400&h=300&fit=crop' },
  { id: 'sample-o3', name: 'Organic Honey', description: 'Raw, unfiltered multi-flora forest honey.', price_per_kg: 450, quantity_kg: 25, category: 'Seeds', location: 'Mahabaleshwar, Maharashtra', is_available: true, farmer_id: 'demo-farmer', image_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=300&fit=crop' },
  { id: 'sample-o4', name: 'Groundnut (Peanuts)', description: 'Bold variety raw groundnuts, hand-picked.', price_per_kg: 95, quantity_kg: 300, category: 'Seeds', location: 'Junagadh, Gujarat', is_available: true, farmer_id: 'demo-farmer', image_url: 'https://images.unsplash.com/photo-1567892737950-30c4db37cd89?w=400&h=300&fit=crop' },
  { id: 'sample-o5', name: 'Vermicompost Fertilizer', description: 'Premium vermicompost for organic farming.', price_per_kg: 12, quantity_kg: 1000, category: 'Seeds', location: 'Wardha, Maharashtra', is_available: true, farmer_id: 'demo-farmer', image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop' },
]

/** Demo farmer data for display when using sample products */
export const sampleFarmers = {
  'demo-farmer': {
    name: 'KrishiMitra Farm',
    avatar_url: null,
  },
}

export default sampleProducts

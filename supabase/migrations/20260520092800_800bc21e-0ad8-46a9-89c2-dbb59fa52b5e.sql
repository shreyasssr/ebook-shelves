
-- Fix mutable search_path on helpers
ALTER FUNCTION public.set_updated_at() SET search_path = public;
ALTER FUNCTION public.refresh_language_book_count() SET search_path = public;

-- Lock down has_role + handle_new_user execute (only postgres + service_role need them; RLS uses has_role via SECURITY DEFINER context)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Replace broad "Public read book assets" with a no-list policy that still lets clients fetch individual files by URL.
-- Public buckets serve files via the storage CDN without needing storage.objects SELECT — drop the broad policy.
DROP POLICY IF EXISTS "Public read book assets" ON storage.objects;

-- ============ SEED DATA ============
INSERT INTO public.languages (code, name, native_name, display_order) VALUES
  ('en', 'English', 'English', 1),
  ('hi', 'Hindi', 'हिंदी', 2),
  ('mr', 'Marathi', 'मराठी', 3),
  ('gu', 'Gujarati', 'ગુજરાતી', 4),
  ('bn', 'Bengali', 'বাংলা', 5),
  ('ta', 'Tamil', 'தமிழ்', 6)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.categories (name, slug) VALUES
  ('Fiction', 'fiction'),
  ('Self Help', 'self-help'),
  ('Biography', 'biography'),
  ('Education', 'education'),
  ('Business', 'business'),
  ('Spirituality', 'spirituality'),
  ('Children', 'children'),
  ('Poetry', 'poetry')
ON CONFLICT (slug) DO NOTHING;

-- Sample books
INSERT INTO public.books (name, slug, author, description, long_description, language_id, category_id, price, discount_price, file_url, page_count, publisher, published_year, what_is_included, faqs, tags, is_published)
SELECT
  'The Mindful Path', 'the-mindful-path', 'Anita Sharma',
  'A practical guide to building daily mindfulness habits that last.',
  'In this concise and warm guide, Anita Sharma distills two decades of contemplative practice into a daily framework anyone can follow. Each chapter pairs a short teaching with an evening reflection.',
  (SELECT id FROM public.languages WHERE code = 'en'),
  (SELECT id FROM public.categories WHERE slug = 'self-help'),
  299, 199, 'ebooks/sample-mindful-path.pdf', 248, 'Lotus Press', 2023,
  ARRAY['248 pages of guided practice','30-day habit tracker','Audio companion download'],
  '[{"question":"Is this suitable for beginners?","answer":"Yes — it assumes no prior meditation experience and starts with five-minute exercises."}]'::jsonb,
  ARRAY['mindfulness','habits','wellbeing'], true
WHERE NOT EXISTS (SELECT 1 FROM public.books WHERE slug = 'the-mindful-path');

INSERT INTO public.books (name, slug, author, description, long_description, language_id, category_id, price, discount_price, file_url, page_count, publisher, published_year, what_is_included, faqs, tags, is_published)
SELECT
  'गीता का सार', 'geeta-ka-saar', 'पंडित राम कृष्ण',
  'भगवद्गीता के मूल संदेश को सरल हिंदी भाषा में समझाने वाली पुस्तक।',
  'यह पुस्तक भगवद्गीता के 18 अध्यायों का सरल भाषा में सार प्रस्तुत करती है। प्रत्येक श्लोक की व्याख्या आधुनिक जीवन के संदर्भ में दी गई है।',
  (SELECT id FROM public.languages WHERE code = 'hi'),
  (SELECT id FROM public.categories WHERE slug = 'spirituality'),
  249, NULL, 'ebooks/sample-geeta-saar.pdf', 320, 'भारती प्रकाशन', 2022,
  ARRAY['सभी 18 अध्यायों का सार','मूल संस्कृत श्लोक और अनुवाद','दैनिक चिंतन गाइड'],
  '[]'::jsonb, ARRAY['गीता','अध्यात्म','दर्शन'], true
WHERE NOT EXISTS (SELECT 1 FROM public.books WHERE slug = 'geeta-ka-saar');

INSERT INTO public.books (name, slug, author, description, long_description, language_id, category_id, price, discount_price, file_url, page_count, publisher, published_year, what_is_included, faqs, tags, is_published)
SELECT
  'श्यामची आई', 'shyamchi-aai', 'साने गुरुजी',
  'मराठी साहित्यातील एक अजरामर कलाकृती - मातृप्रेमाची हृदयस्पर्शी कहाणी।',
  'साने गुरुजींची ही आत्मकथनात्मक कादंबरी मराठी साहित्यातील एक मानदंड आहे. श्यामच्या आईच्या संस्कारांची, तिच्या त्यागाची आणि प्रेमाची ही गोष्ट प्रत्येक पिढीला प्रेरणा देत आली आहे.',
  (SELECT id FROM public.languages WHERE code = 'mr'),
  (SELECT id FROM public.categories WHERE slug = 'fiction'),
  199, 149, 'ebooks/sample-shyamchi-aai.pdf', 280, 'मेहता पब्लिशिंग हाऊस', 2021,
  ARRAY['मूळ संपूर्ण कादंबरी','साने गुरुजींची प्रस्तावना','42 छोट्या प्रकरणांमध्ये विभागलेले'],
  '[]'::jsonb, ARRAY['साने गुरुजी','क्लासिक','कुटुंब'], true
WHERE NOT EXISTS (SELECT 1 FROM public.books WHERE slug = 'shyamchi-aai');

INSERT INTO public.books (name, slug, author, description, long_description, language_id, category_id, price, discount_price, file_url, page_count, publisher, published_year, what_is_included, faqs, tags, is_published)
SELECT
  'સરસ્વતીચંદ્ર', 'saraswatichandra', 'ગોવર્ધનરામ ત્રિપાઠી',
  'ગુજરાતી સાહિત્યનો સૌથી મહાન સામાજિક ઉપન્યાસ।',
  'ગોવર્ધનરામ ત્રિપાઠી લિખિત આ ચાર ભાગની મહાન કૃતિ ઓગણીસમી સદીના ગુજરાતી સમાજનું પ્રતિબિંબ છે. પ્રેમ, ત્યાગ અને કર્તવ્ય વચ્ચેનો સંઘર્ષ આ ઉપન્યાસનો કેન્દ્રીય વિષય છે.',
  (SELECT id FROM public.languages WHERE code = 'gu'),
  (SELECT id FROM public.categories WHERE slug = 'fiction'),
  399, 299, 'ebooks/sample-saraswatichandra.pdf', 720, 'ગૂર્જર પ્રકાશન', 2020,
  ARRAY['ચારેય ભાગો સંપૂર્ણ','ઐતિહાસિક પ્રસ્તાવના','શબ્દકોશ'],
  '[]'::jsonb, ARRAY['ક્લાસિક','સામાજિક','ગુજરાતી'], true
WHERE NOT EXISTS (SELECT 1 FROM public.books WHERE slug = 'saraswatichandra');

INSERT INTO public.books (name, slug, author, description, long_description, language_id, category_id, price, discount_price, file_url, page_count, publisher, published_year, what_is_included, faqs, tags, is_published)
SELECT
  'গীতাঞ্জলি', 'gitanjali', 'রবীন্দ্রনাথ ঠাকুর',
  'নোবেল পুরস্কার বিজয়ী রবীন্দ্রনাথ ঠাকুরের অমর কাব্যগ্রন্থ।',
  'রবীন্দ্রনাথ ঠাকুরের গীতাঞ্জলি ১৯১৩ সালে সাহিত্যে নোবেল পুরস্কার লাভ করে। এই কাব্যগ্রন্থে ১০৩টি কবিতা সংকলিত রয়েছে যা মানব হৃদয়ের গভীরতম অনুভূতিগুলি স্পর্শ করে।',
  (SELECT id FROM public.languages WHERE code = 'bn'),
  (SELECT id FROM public.categories WHERE slug = 'poetry'),
  179, NULL, 'ebooks/sample-gitanjali.pdf', 160, 'বিশ্বভারতী', 2019,
  ARRAY['১০৩টি কবিতা','বাংলা ও ইংরেজি অনুবাদ','রবীন্দ্রনাথের ভূমিকা'],
  '[]'::jsonb, ARRAY['রবীন্দ্রনাথ','কবিতা','নোবেল'], true
WHERE NOT EXISTS (SELECT 1 FROM public.books WHERE slug = 'gitanjali');

INSERT INTO public.books (name, slug, author, description, long_description, language_id, category_id, price, discount_price, file_url, page_count, publisher, published_year, what_is_included, faqs, tags, is_published)
SELECT
  'திருக்குறள் விளக்கம்', 'thirukkural-vilakkam', 'வ. சுப்ரமணியன்',
  'திருவள்ளுவரின் திருக்குறளுக்கான முழுமையான விளக்க உரை।',
  'வாழ்க்கையின் அனைத்து அம்சங்களையும் இரண்டே வரிகளில் சொல்லும் திருக்குறளுக்கு இந்த நூல் தெளிவான விளக்கம் தருகிறது. 1330 குறள்களும் அவற்றின் தற்கால பொருளும் இடம் பெற்றுள்ளன.',
  (SELECT id FROM public.languages WHERE code = 'ta'),
  (SELECT id FROM public.categories WHERE slug = 'spirituality'),
  349, 249, 'ebooks/sample-thirukkural.pdf', 540, 'காவியா பதிப்பகம்', 2022,
  ARRAY['1330 குறள்களும்','தற்கால தமிழ் விளக்கம்','ஆங்கில மொழிபெயர்ப்பு'],
  '[]'::jsonb, ARRAY['திருக்குறள்','தமிழ்','நீதி'], true
WHERE NOT EXISTS (SELECT 1 FROM public.books WHERE slug = 'thirukkural-vilakkam');

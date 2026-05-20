
-- ============ ENUMS / ROLES ============
CREATE TYPE public.app_role AS ENUM ('customer', 'admin');

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============ USER ROLES (separate table to avoid privilege escalation) ============
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- ============ LANGUAGES ============
CREATE TABLE public.languages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  native_name text,
  book_count integer NOT NULL DEFAULT 0,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============ CATEGORIES ============
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============ BOOKS ============
CREATE TABLE public.books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  author text NOT NULL,
  isbn text,
  description text NOT NULL,
  long_description text,
  language_id uuid NOT NULL REFERENCES public.languages(id) ON DELETE RESTRICT,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  price numeric(10,2) NOT NULL,
  discount_price numeric(10,2),
  thumbnail_url text,
  file_url text NOT NULL,
  preview_url text,
  page_count integer,
  publisher text,
  published_year integer,
  edition text,
  what_is_included text[] DEFAULT '{}',
  faqs jsonb DEFAULT '[]'::jsonb,
  tags text[] DEFAULT '{}',
  is_published boolean NOT NULL DEFAULT false,
  sales_count integer NOT NULL DEFAULT 0,
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(name, '') || ' ' || coalesce(author, '') || ' ' || coalesce(description, ''))
  ) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX books_search_idx ON public.books USING GIN(search_vector);
CREATE INDEX books_language_idx ON public.books(language_id);
CREATE INDEX books_author_idx ON public.books(author);
CREATE INDEX books_slug_idx ON public.books(slug);
CREATE INDEX books_published_idx ON public.books(is_published);

-- ============ ORDERS ============
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','failed','refunded')),
  total_amount numeric(10,2) NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('razorpay','cod')),
  payment_gateway_order_id text,
  payment_reference_id text,
  access_granted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX orders_user_idx ON public.orders(user_id);
CREATE INDEX orders_status_idx ON public.orders(status);

-- ============ ORDER ITEMS ============
CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE RESTRICT,
  book_name text NOT NULL,
  author text NOT NULL,
  unit_price numeric(10,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX order_items_order_idx ON public.order_items(order_id);

-- ============ DIGITAL DOWNLOADS ============
CREATE TABLE public.digital_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  download_token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  download_url text NOT NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  download_count integer NOT NULL DEFAULT 0,
  max_downloads integer NOT NULL DEFAULT 5,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX downloads_user_idx ON public.digital_downloads(user_id);
CREATE INDEX downloads_order_idx ON public.digital_downloads(order_id);

-- ============ CART ITEMS ============
CREATE TABLE public.cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, book_id)
);

-- ============ BULK IMPORT JOBS ============
CREATE TABLE public.bulk_import_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES auth.users(id),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed')),
  total_rows integer NOT NULL DEFAULT 0,
  processed_rows integer NOT NULL DEFAULT 0,
  success_rows integer NOT NULL DEFAULT 0,
  error_rows integer NOT NULL DEFAULT 0,
  error_log jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

-- ============ TRIGGERS ============
-- updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER books_updated_at BEFORE UPDATE ON public.books
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- auto-create profile + customer role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- keep languages.book_count in sync
CREATE OR REPLACE FUNCTION public.refresh_language_book_count()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    UPDATE public.languages SET book_count = (
      SELECT COUNT(*) FROM public.books WHERE language_id = NEW.language_id AND is_published = true
    ) WHERE id = NEW.language_id;
  END IF;
  IF (TG_OP = 'UPDATE' OR TG_OP = 'DELETE') THEN
    UPDATE public.languages SET book_count = (
      SELECT COUNT(*) FROM public.books WHERE language_id = OLD.language_id AND is_published = true
    ) WHERE id = OLD.language_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER books_language_count
  AFTER INSERT OR UPDATE OR DELETE ON public.books
  FOR EACH ROW EXECUTE FUNCTION public.refresh_language_book_count();

-- ============ RLS ============
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_import_jobs ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins read all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- user_roles
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- languages
CREATE POLICY "Public read languages" ON public.languages FOR SELECT USING (true);
CREATE POLICY "Admins manage languages" ON public.languages FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- categories
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- books
CREATE POLICY "Public read published books" ON public.books FOR SELECT USING (is_published = true);
CREATE POLICY "Admins read all books" ON public.books FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage books" ON public.books FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- orders
CREATE POLICY "Users read own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins read all orders" ON public.orders FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users create own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins update orders" ON public.orders FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- order_items
CREATE POLICY "Users read own order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid())
);
CREATE POLICY "Users insert own order items" ON public.order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid())
);
CREATE POLICY "Admins read all order items" ON public.order_items FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- digital_downloads
CREATE POLICY "Users read own downloads" ON public.digital_downloads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins read all downloads" ON public.digital_downloads FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage downloads" ON public.digital_downloads FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- cart_items
CREATE POLICY "Users manage own cart" ON public.cart_items FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- bulk_import_jobs
CREATE POLICY "Admins manage bulk imports" ON public.bulk_import_jobs FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ============ STORAGE BUCKETS ============
INSERT INTO storage.buckets (id, name, public) VALUES ('ebooks', 'ebooks', false) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('book-assets', 'book-assets', true) ON CONFLICT DO NOTHING;

-- book-assets policies (public read, admin write)
CREATE POLICY "Public read book assets" ON storage.objects FOR SELECT USING (bucket_id = 'book-assets');
CREATE POLICY "Admins upload book assets" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'book-assets' AND public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Admins update book assets" ON storage.objects FOR UPDATE USING (
  bucket_id = 'book-assets' AND public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Admins delete book assets" ON storage.objects FOR DELETE USING (
  bucket_id = 'book-assets' AND public.has_role(auth.uid(), 'admin')
);

-- ebooks bucket: admin write only, no direct read (signed URLs only via server)
CREATE POLICY "Admins upload ebooks" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'ebooks' AND public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Admins manage ebooks" ON storage.objects FOR ALL USING (
  bucket_id = 'ebooks' AND public.has_role(auth.uid(), 'admin')
);

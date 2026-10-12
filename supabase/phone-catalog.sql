-- Run once in the Supabase SQL Editor to create and seed the public catalog.
-- The app reads through its server using the anon key; only SELECT is granted.
create table if not exists public.phones (
  id text primary key,
  brand text not null,
  model text not null,
  image text not null,
  price integer not null check (price >= 0),
  rating numeric(2, 1) not null check (rating >= 0 and rating <= 5),
  release_year integer not null,
  color text not null,
  display text not null,
  processor text not null,
  ram text not null,
  storage text not null,
  cameras text not null,
  battery text not null,
  charging text not null,
  os text not null,
  supports_5g boolean not null default false
);

alter table public.phones enable row level security;

drop policy if exists "Phone catalog is publicly readable" on public.phones;
create policy "Phone catalog is publicly readable"
  on public.phones
  for select
  to anon, authenticated
  using (true);

grant select on public.phones to anon, authenticated;

insert into public.phones (
  id, brand, model, image, price, rating, release_year, color, display,
  processor, ram, storage, cameras, battery, charging, os, supports_5g
) values
  ('iphone-15-pro', 'Apple', 'iPhone 15 Pro', 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/IPhone_15_Pro_Natural_Titanium.svg/512px-IPhone_15_Pro_Natural_Titanium.svg.png', 999, 4.8, 2023, 'Natural Titanium', '6.1-inch Super Retina XDR OLED, 120Hz', 'A17 Pro', '8 GB', '128 GB', '48 MP main + 12 MP ultrawide + 12 MP 3× telephoto', '3,274 mAh', '20W wired, 15W MagSafe', 'iOS 17', true),
  ('iphone-15', 'Apple', 'iPhone 15', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/IPhone_15_Blue.svg/512px-IPhone_15_Blue.svg.png', 799, 4.6, 2023, 'Blue', '6.1-inch Super Retina XDR OLED, 60Hz', 'A16 Bionic', '6 GB', '128 GB', '48 MP main + 12 MP ultrawide', '3,349 mAh', '20W wired, 15W MagSafe', 'iOS 17', true),
  ('galaxy-s24-ultra', 'Samsung', 'Galaxy S24 Ultra', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Galaxy_S24_Ultra_Titanium_Black.jpg/512px-Samsung_Galaxy_S24_Ultra_Titanium_Black.jpg', 1299, 4.8, 2024, 'Titanium Gray', '6.8-inch Dynamic AMOLED 2X, 120Hz', 'Snapdragon 8 Gen 3 for Galaxy', '12 GB', '256 GB', '200 MP main + 12 MP ultrawide + 50 MP 5× + 10 MP 3×', '5,000 mAh', '45W wired, 15W wireless', 'Android 14 · One UI 6.1', true),
  ('galaxy-s24', 'Samsung', 'Galaxy S24', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Samsung_Galaxy_S24.jpg/512px-Samsung_Galaxy_S24.jpg', 799, 4.6, 2024, 'Cobalt Violet', '6.2-inch Dynamic AMOLED 2X, 120Hz', 'Exynos 2400', '8 GB', '128 GB', '50 MP main + 12 MP ultrawide + 10 MP 3× telephoto', '4,000 mAh', '25W wired, 15W wireless', 'Android 14 · One UI 6.1', true),
  ('pixel-8-pro', 'Google', 'Pixel 8 Pro', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Google_Pixel_8_Pro.jpg/512px-Google_Pixel_8_Pro.jpg', 999, 4.7, 2023, 'Bay', '6.7-inch LTPO OLED, 120Hz', 'Google Tensor G3', '12 GB', '128 GB', '50 MP main + 48 MP ultrawide + 48 MP 5× telephoto', '5,050 mAh', '30W wired, 23W wireless', 'Android 14', true),
  ('pixel-8a', 'Google', 'Pixel 8a', 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Google_Pixel_8a.jpg/512px-Google_Pixel_8a.jpg', 499, 4.5, 2024, 'Bay', '6.1-inch Actua OLED, 120Hz', 'Google Tensor G3', '8 GB', '128 GB', '64 MP main + 13 MP ultrawide', '4,492 mAh', '18W wired, 7.5W wireless', 'Android 14', true),
  ('oneplus-12', 'OnePlus', '12', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/OnePlus_12.jpg/512px-OnePlus_12.jpg', 799, 4.7, 2024, 'Silky Black', '6.82-inch LTPO AMOLED, 120Hz', 'Snapdragon 8 Gen 3', '12 GB', '256 GB', '50 MP main + 48 MP ultrawide + 64 MP 3× periscope', '5,400 mAh', '100W wired, 50W wireless', 'Android 14 · OxygenOS 14', true),
  ('nothing-phone-2a', 'Nothing', 'Phone (2a)', 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Nothing_Phone_2a.jpg/512px-Nothing_Phone_2a.jpg', 349, 4.3, 2024, 'Milk', '6.7-inch AMOLED, 120Hz', 'MediaTek Dimensity 7200 Pro', '8 GB', '128 GB', '50 MP main + 50 MP ultrawide', '5,000 mAh', '45W wired', 'Android 14 · Nothing OS 2.5', true),
  ('moto-edge-50-pro', 'Motorola', 'Edge 50 Pro', 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Motorola_Edge_50_Pro.jpg/512px-Motorola_Edge_50_Pro.jpg', 699, 4.4, 2024, 'Luxe Lavender', '6.7-inch pOLED, 144Hz', 'Snapdragon 7 Gen 3', '12 GB', '256 GB', '50 MP main + 13 MP ultrawide + 10 MP 3× telephoto', '4,500 mAh', '125W wired, 50W wireless', 'Android 14', true),
  ('galaxy-a55', 'Samsung', 'Galaxy A55 5G', 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Samsung_Galaxy_A55_5G.jpg/512px-Samsung_Galaxy_A55_5G.jpg', 449, 4.3, 2024, 'Awesome Navy', '6.6-inch Super AMOLED, 120Hz', 'Exynos 1480', '8 GB', '128 GB', '50 MP main + 12 MP ultrawide + 5 MP macro', '5,000 mAh', '25W wired', 'Android 14 · One UI 6.1', true),
  ('iphone-se-3', 'Apple', 'iPhone SE (3rd gen)', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/IPhone_SE_3rd_generation.jpg/512px-IPhone_SE_3rd_generation.jpg', 429, 4.2, 2022, 'Midnight', '4.7-inch Retina HD LCD, 60Hz', 'A15 Bionic', '4 GB', '64 GB', '12 MP main', '2,018 mAh', '20W wired, 7.5W wireless', 'iOS 15', true),
  ('redmi-note-13-pro', 'Xiaomi', 'Redmi Note 13 Pro 5G', 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Xiaomi_Redmi_Note_13_Pro.jpg/512px-Xiaomi_Redmi_Note_13_Pro.jpg', 329, 4.3, 2024, 'Midnight Black', '6.67-inch AMOLED, 120Hz', 'Snapdragon 7s Gen 2', '8 GB', '256 GB', '200 MP main + 8 MP ultrawide + 2 MP macro', '5,100 mAh', '67W wired', 'Android 13 · MIUI 14', true)
on conflict (id) do nothing;

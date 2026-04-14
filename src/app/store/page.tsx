// src/app/(store)/page.tsx
import { Metadata } from 'next';
import HeroSection from '@/components/home/HeroSection';
import CategoryGrid from '@/components/home/CategoryGrid';
import FlashSale from '@/components/home/FlashSale';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import BestSellers from '@/components/home/BestSellers';
import PromoBanners from '@/components/home/PromoBanners';
import TrustStrip from '@/components/home/TrustStrip';
import NewsletterSection from '@/components/home/NewsletterSection';

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Ecove – Nigeria's Online Marketplace | Shop Smart, Live Better",
  description:
    'Shop electronics, fashion, home appliances, phones, beauty products and more at the best prices in Nigeria. Fast delivery nationwide.',
  openGraph: {
    title: "Ecove – Nigeria's Online Marketplace",
    description: 'Shop from thousands of verified sellers across Nigeria.',
    images: ['/og-image.jpg'],
  },
};

async function getHomepageData() {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

  const [banners, categories, flashSaleProducts, featuredProducts, bestSellers] =
    await Promise.all([
      fetch(`${base}/api/banners?position=hero_slider&isActive=true`, {
        next: { revalidate: 300 },
      }).then((r) => r.json()),
      fetch(`${base}/api/categories?isActive=true&limit=12`, {
        next: { revalidate: 600 },
      }).then((r) => r.json()),
      fetch(`${base}/api/products?flashSale=true&limit=8`, {
        next: { revalidate: 60 },
      }).then((r) => r.json()),
      fetch(`${base}/api/products?featured=true&limit=12`, {
        next: { revalidate: 300 },
      }).then((r) => r.json()),
      fetch(`${base}/api/products?bestSeller=true&limit=12`, {
        next: { revalidate: 300 },
      }).then((r) => r.json()),
    ]);

  return { banners, categories, flashSaleProducts, featuredProducts, bestSellers };
}

export default async function HomePage() {
  const { banners, categories, flashSaleProducts, featuredProducts, bestSellers } =
    await getHomepageData();

  return (
    <main>
      <TrustStrip />
      <HeroSection banners={banners} categories={categories} />
      <CategoryGrid categories={categories} />
      <FlashSale products={flashSaleProducts} />
      <FeaturedProducts products={featuredProducts} />
      <PromoBanners />
      <BestSellers products={bestSellers} />
      <NewsletterSection />
    </main>
  );
}

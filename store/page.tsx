import HeroSection from '@/components/home/HeroSection'
import CategoryGrid from '@/components/home/CategoryGrid'
import FlashSale from '@/components/home/FlashSale'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import BestSellers from '@/components/home/BestSellers'

export default function StorePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <HeroSection />
      <CategoryGrid />
      <FlashSale />
      <FeaturedProducts />
      <BestSellers />
    </div>
  )
}
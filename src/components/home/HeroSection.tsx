'use client'

type HeroSectionProps = {
  banners?: any
  categories?: any
}

export default function HeroSection({ banners, categories }: HeroSectionProps) {
  return (
    <div className="bg-orange-500 text-white p-10 rounded-xl mb-6">
      <h1 className="text-3xl font-bold">Welcome to Ecove</h1>
      <p className="mt-2">Shop the best products</p>
    </div>
  )
}
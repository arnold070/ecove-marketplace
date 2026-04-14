type FeaturedProductsProps = {
  products?: any
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  return (
    <div className="mb-6">
      <h2 className="font-bold">Featured Products</h2>
      <p>Top picks for you</p>
    </div>
  )
}
type BestSellersProps = {
  products?: any
}

export default function BestSellers({ products }: BestSellersProps) {
  return (
    <div className="mb-6">
      <h2 className="font-bold">Best Sellers</h2>
      <p>Most popular items</p>
    </div>
  )
}
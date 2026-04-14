export default function CategoryGrid() {
  return (
    <div className="mb-6">
      <h2 className="font-bold mb-2">Categories</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-gray-100 rounded-lg">Electronics</div>
        <div className="p-4 bg-gray-100 rounded-lg">Fashion</div>
        <div className="p-4 bg-gray-100 rounded-lg">Home</div>
        <div className="p-4 bg-gray-100 rounded-lg">Beauty</div>
      </div>
    </div>
  )
}
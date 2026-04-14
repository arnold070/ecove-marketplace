export default function VendorPoliciesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-extrabold mb-6">Vendor Policies</h1>

      <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
        <p>
          These policies govern all vendors selling on the Ecove marketplace.
          By registering as a vendor, you agree to comply with the rules below.
        </p>

        <h2 className="text-lg font-bold text-gray-800">1. Product Listings</h2>
        <p>
          Vendors must list only authentic products with accurate descriptions,
          images, and pricing. Misleading listings may be removed.
        </p>

        <h2 className="text-lg font-bold text-gray-800">2. Order Fulfillment</h2>
        <p>
          Vendors are responsible for processing and shipping orders within the
          stated handling time.
        </p>

        <h2 className="text-lg font-bold text-gray-800">3. Returns & Refunds</h2>
        <p>
          Vendors must honor Ecove’s return policy and cooperate in resolving
          customer disputes.
        </p>

        <h2 className="text-lg font-bold text-gray-800">4. Prohibited Items</h2>
        <p>
          Illegal, counterfeit, or restricted items are strictly prohibited.
          Violations may lead to account suspension.
        </p>

        <h2 className="text-lg font-bold text-gray-800">5. Account Termination</h2>
        <p>
          Ecove reserves the right to suspend or terminate vendor accounts that
          violate policies or engage in fraudulent activity.
        </p>
      </div>
    </div>
  )
}
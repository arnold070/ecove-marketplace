import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Returns Policy – Ecove Marketplace',
  description: 'Learn about Ecove returns, refunds, and exchange policy.',
}

export default function ReturnsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-extrabold mb-4">Returns Policy</h1>

      <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
        <p>
          You can return eligible items within 7 days of delivery. Items must be unused,
          in original packaging, and in resellable condition.
        </p>

        <p>
          Refunds are processed after inspection and may take 3–7 business days.
        </p>

        <p>
          Some items like digital products, perishable goods, and personal items are not eligible for returns.
        </p>

        <p>
          For issues, contact support through your dashboard or email.
        </p>
      </div>
    </div>
  )
}
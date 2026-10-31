import { PageHeader } from '../../components/PageHeader'
import { FeaturePlaceholderPage } from '../../components/FeaturePlaceholderPage'

export default function DiscountsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Discounts"
        subtitle="Launch promotions, coupon logic, and account-specific credits."
      />

      <FeaturePlaceholderPage
        eyebrow="Promotions"
        title="Discount catalog"
        description="This area will handle percentage-based discounts, fixed credits, and eligibility rules for plans and invoices."
        cards={[
          { label: 'Active', value: '24', note: 'Campaigns' },
          { label: 'Usage', value: '11%', note: 'Avg. redemption' },
          { label: 'Drafts', value: '5', note: 'In review' },
        ]}
      />
    </div>
  )
}

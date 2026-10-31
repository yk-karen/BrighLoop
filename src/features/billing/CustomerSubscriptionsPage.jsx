import { PageHeader } from '../../components/PageHeader'
import { FeaturePlaceholderPage } from '../../components/FeaturePlaceholderPage'

export default function CustomerSubscriptionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="My subscriptions"
        subtitle="Track billing cadence, current plan benefits, and upcoming renewals."
      />

      <FeaturePlaceholderPage
        eyebrow="Portfolio"
        title="Subscription overview"
        description="This customer view will show active SaaS subscriptions, usage insights, and upgrade controls when the product logic is added."
        cards={[
          { label: 'Current plan', value: 'Pro', note: 'Annual billing' },
          { label: 'Renewal', value: 'Oct 24', note: 'Next cycle' },
          { label: 'Seat usage', value: '18/30', note: 'Included seats' },
        ]}
      />
    </div>
  )
}

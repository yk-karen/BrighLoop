import { PageHeader } from '../../components/PageHeader'
import { FeaturePlaceholderPage } from '../../components/FeaturePlaceholderPage'

export default function SubscriptionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscriptions"
        subtitle="Monitor billing state, renewals, and active purchase commitments."
      />

      <FeaturePlaceholderPage
        eyebrow="Operations"
        title="Subscription lifecycle"
        description="This page will show renewal status, billing events, cancellations, and account-level subscription actions."
        cards={[
          { label: 'Live', value: '1,284', note: 'Active subscriptions' },
          { label: 'Trialing', value: '142', note: 'Current trials' },
          { label: 'Renewals', value: '87', note: 'Next 7 days' },
        ]}
      />
    </div>
  )
}

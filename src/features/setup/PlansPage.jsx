import { PageHeader } from '../../components/PageHeader'
import { FeaturePlaceholderPage } from '../../components/FeaturePlaceholderPage'

export default function PlansPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Plans"
        subtitle="Design pricing strategies, trial windows, and plan upgrades."
      />

      <FeaturePlaceholderPage
        eyebrow="Pricing"
        title="Plan configuration"
        description="This page will contain pricing tiers, billing cadence settings, and enterprise negotiation rules."
        cards={[
          { label: 'Starter', value: '$29', note: 'Monthly' },
          { label: 'Growth', value: '$89', note: 'Monthly' },
          { label: 'Enterprise', value: 'Custom', note: 'Contracted' },
        ]}
      />
    </div>
  )
}

import { PageHeader } from '../../components/PageHeader'
import { FeaturePlaceholderPage } from '../../components/FeaturePlaceholderPage'

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        subtitle="Review payment processors, settlements, and successful transaction events."
      />

      <FeaturePlaceholderPage
        eyebrow="Processing"
        title="Payment activity"
        description="This screen will surface transaction status, payout windows, gateway health, and payment dispute handling."
        cards={[
          { label: 'Success', value: '97.2%', note: 'Approval rate' },
          { label: 'Pending', value: '26', note: 'Transactions' },
          { label: 'Payouts', value: '$42.8K', note: 'Next batch' },
        ]}
      />
    </div>
  )
}

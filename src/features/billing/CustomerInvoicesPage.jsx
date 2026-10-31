import { PageHeader } from '../../components/PageHeader'
import { FeaturePlaceholderPage } from '../../components/FeaturePlaceholderPage'

export default function CustomerInvoicesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        subtitle="Review payment history, invoice PDFs, and account balances."
      />

      <FeaturePlaceholderPage
        eyebrow="Billing history"
        title="Invoice center"
        description="This customer-facing billing screen will surface downloadable documents, payment status, and plan billing summaries."
        cards={[
          { label: 'Open balance', value: '$0.00', note: 'Current due amount' },
          { label: 'Last invoice', value: '$149', note: 'Issued Sep 30' },
          { label: 'Payment method', value: 'Visa •• 9032', note: 'Primary card' },
        ]}
      />
    </div>
  )
}

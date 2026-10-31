import { PageHeader } from '../../components/PageHeader'
import { FeaturePlaceholderPage } from '../../components/FeaturePlaceholderPage'

export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        subtitle="Track issued invoices, collection health, and payment milestones."
      />

      <FeaturePlaceholderPage
        eyebrow="Accounts receivable"
        title="Invoice overview"
        description="The invoice manager will support billing runs, payment reminders, and downloadable records for downstream finance workflows."
        cards={[
          { label: 'Issued', value: '468', note: 'This month' },
          { label: 'Paid', value: '92%', note: 'Collection rate' },
          { label: 'Overdue', value: '34', note: 'Accounts' },
        ]}
      />
    </div>
  )
}

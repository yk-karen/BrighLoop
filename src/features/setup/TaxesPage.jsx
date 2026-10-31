import { PageHeader } from '../../components/PageHeader'
import { FeaturePlaceholderPage } from '../../components/FeaturePlaceholderPage'

export default function TaxesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Taxes"
        subtitle="Maintain compliance with regional tax rules and invoice logic."
      />

      <FeaturePlaceholderPage
        eyebrow="Compliance"
        title="Tax rules workspace"
        description="This screen will host tax profiles, jurisdiction logic, and exemption handling for each market."
        cards={[
          { label: 'Regions', value: '18', note: 'Tax profiles' },
          { label: 'VAT', value: '7.5%', note: 'Default rate' },
          { label: 'Exceptions', value: '12', note: 'Approved cases' },
        ]}
      />
    </div>
  )
}

import { PageHeader } from '../../components/PageHeader'
import { FeaturePlaceholderPage } from '../../components/FeaturePlaceholderPage'

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        subtitle="Manage product catalog, packaging, and revenue-driving SKUs."
      />

      <FeaturePlaceholderPage
        eyebrow="Catalog"
        title="Product management workspace"
        description="This surface will house product definitions, feature access, and usage-based product logic when the team is ready to implement it."
        cards={[
          { label: 'Services', value: '18', note: 'Active product lines' },
          { label: 'Bundles', value: '6', note: 'Cross-sell packages' },
          { label: 'Catalog score', value: '94%', note: 'Health rating' },
        ]}
      />
    </div>
  )
}

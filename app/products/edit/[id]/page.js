import { EntityForm, DashboardShell } from "@/app/components"

export default async function UpdateCategoryPage({ params }) {

  const { id } = params
  const res = await fetch(`https://custompackboxes.com/api/products/${id}`, {
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error("Failed to fetch product")
  }

  const product = await res.json()
  return (
    <DashboardShell>
      <div className="grid gap-4">
        <EntityForm entityType="products" initialData={product} />
      </div>
    </DashboardShell>
  )
}

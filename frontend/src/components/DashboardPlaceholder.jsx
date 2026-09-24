function DashboardPlaceholder({ title, description }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      <p className="mt-2 text-slate-600">{description}</p>
    </section>
  )
}

export default DashboardPlaceholder

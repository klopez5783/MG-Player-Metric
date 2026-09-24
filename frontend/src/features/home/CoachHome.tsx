import AppHeader from '../../components/AppHeader'

export default function CoachHome() {
  return (
    <div className="min-h-screen bg-slate-100">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-slate-900">Coach dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">
          Your players, evaluations and drills will show up here.
        </p>
      </main>
    </div>
  )
}

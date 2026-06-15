import './Dashboard.css'

export function Dashboard() {
  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2>Projects</h2>
        <p className="empty-list">No projects yet</p>
      </aside>
      <main className="main">
        <div className="empty-state">
          <h1>Welcome to BuildMind</h1>
          <p>No projects yet. Create your first project to get started.</p>
        </div>
      </main>
    </div>
  )
}

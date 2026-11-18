export default function ProjectOverview({ project, onOpenLayer }) {
  const { layers, loading, refreshLayers } = project

  return (
    <section id="project-layers">
      <h2>Project layers</h2>

      <button type="button" onClick={refreshLayers} disabled={loading}>
        {loading ? 'Loading layers…' : 'Refresh layers'}
      </button>

      {layers?.length === 0 && <p>This project has no layers.</p>}

      {layers?.length > 0 && (
        <ul>
          {layers.map(layer => (
            <li key={layer.id}>
              <button
                type="button"
                onClick={() => onOpenLayer(layer.id)}
                disabled={loading}
              >
                {layer.name}
              </button>{' '}
              <code>{layer.id}</code>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

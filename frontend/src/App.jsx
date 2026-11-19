import { 
  useState,
  useEffect, 
} from 'react'

import { 
  refreshPlugin, 
} from './qgisBridge.js'

import useProjectLayers from './features/project/useProjectLayers.js'
import ProjectOverview from './features/project/ProjectOverview.jsx'
import LayerPage from './features/layers/LayerPage.jsx'
import './App.css'

function App() {
  const [loading, setLoading] = useState(false)
  const [refreshError, setReError] = useState('')
  
  const {
    layers,
    loading: layersLoading,
    error: layerError,
    refreshLayers,
  } = useProjectLayers()
  const busy = layersLoading || loading

  // layer fields & related properties
  const [selectedLayerFields, setSelectedLayerFields] = useState('')
  const project = useProjectLayers()
  const [layerId, setLayerId] = useState(null)
  const layer = project.layers?.find(item => item.id === layerId)

  useEffect(() => {
    if (layerId !== null && project.layers !== null && !layer) {
      setLayerId(null)
    }
  }, [layerId, project.layers, layer])

  // layer field defaults & related properties
  const [selectedFieldDefault, setSelectedFieldDefault] = useState('')

  async function callRefresh() {
    
    setReError('')
    const pluginName = 'qgis_management'
    try {
      const result = await refreshPlugin(pluginName)
      
      if (result == 'False'){
        setReError('Refresh returned false')
      } else {
        setReError(result)
      }
    } catch (err) {
      setReError(err instanceof Error ? err.message : String(err))
    } 
  }

  useEffect(() => {
    if (layers === null || !selectedLayerFields) return

    const selectedLayerExists = layers.some(
      layer => layer.id === selectedLayerFields
    )

    if (!selectedLayerExists) {
      setSelectedLayerFields('')
      setSelectedFieldDefault('')
      setFields(null)
      setFieldError('')
    }
  }, [layers, selectedLayerFields])

  return (
    <>
      <section id="refresh-button">
        <button type="button" onClick={callRefresh}> 
          Reload plugin 
        </button>
        {refreshError && <p role="alert" className='error-text'> {refreshError}</p>}
      </section>

      {project.error && <p role="alert">{project.error}</p>}

      {layer ? (
        <LayerPage
          key={layer.id}
          layer={layer}
          onBack={() => setLayerId(null)}
        />
      ) : (
        <ProjectOverview
          project={project}
          onOpenLayer={setLayerId}
        />
      )}
    </>
  )
}

export default App

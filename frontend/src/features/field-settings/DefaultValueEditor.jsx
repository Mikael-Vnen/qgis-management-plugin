import { useState } from 'react'
import {
  qgisReadFieldSettings,
  qgisSetFieldDefault,
} from '../../qgisBridge.js'

export default function DefaultValueEditor({
  layerId,
  fieldName,
  loading,
  onLoadingChange,
}) {
  const [defaults, setDefaults] = useState(null)
  const [defaultsError, setDefaultError] = useState('')
  const [expressionDraft, setExpressionDraft] = useState('')
  const [applyOnUpdateDraft, setApplyOnUpdateDraft] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  const defaultRule = defaults?.[fieldName]?.defaultValue

  const canEditDefault = Boolean(
    layerId &&
    fieldName &&
    defaults !== null &&
    defaultRule !== undefined
  )

    async function applyFieldDefault(expression, applyOnUpdate) {

        if (loading) return

        setDefaultError('')
        setSaveMessage('')

        if (!canEditDefault) {
        setDefaultError('Retrieve the selected field’s default before editing.')
        return
        }

        onLoadingChange(true)

        try {
        const result = await qgisSetFieldDefault(
            layerId,
            fieldName,
            expression,
            applyOnUpdate,
        )

        if (result.error !== null) {
            throw new Error(result.error)
        }

        const rule = result.settings[fieldName].defaultValue

        setDefaults(result.settings)
        setExpressionDraft(rule?.expression ?? '')
        setApplyOnUpdateDraft(rule?.applyOnUpdate ?? false)
        setSaveMessage('Applied in QGIS. Save the project to keep the change.')
        } catch (err) {
        setDefaultError(err instanceof Error ? err.message : String(err))
        } finally {
        onLoadingChange(false)
        }
    }

    async function getFieldDefaults() {

        onLoadingChange(true)
        setDefaults(null)
        setDefaultError('')

        if (!layerId || !fieldName) {
            setDefaultError('Layer not selected')
            onLoadingChange(false)
            return
        } 
        
        try {
        const result = await qgisReadFieldSettings(
            layerId, 
            [fieldName], 
            ['defaultValue']
        )

        if (result.error !== null) {
            setDefaults(null)
            setDefaultError(result.error)
        } else {
            const rule = result.settings[fieldName].defaultValue
            setDefaults(result.settings)
            setExpressionDraft(rule?.expression ?? '')
            setApplyOnUpdateDraft(rule?.applyOnUpdate ?? false)
            setSaveMessage('')
        }

        } catch (err) {
        setDefaultError(err instanceof Error ? err.message : String(err))
        } finally {
        onLoadingChange(false)
        }
    }

  return (
    <section id="field-default-values">
      <h2>Field default values</h2>

        <button type="button" onClick={getFieldDefaults} disabled={loading}>
          {loading ? 'Loading…' : 'Get default value'}
        </button>

        {defaultsError && <p id="field-defaults-error" className="error-text" role="alert"> {defaultsError}</p>}
       
        {defaults === null ? (
          <p>Select a field and retrieve its default value.</p>
        ) : defaultRule === null ? (
          <p>No QGIS default-value rule is configured for this field.</p>
        ) : defaultRule === undefined ? (
          <p role="alert">The response did not contain the requested setting.</p>
        ) : (
          <div>
            <p>Expression: <code>{defaultRule.expression}</code></p>
            <p>Apply on update: {defaultRule.applyOnUpdate ? 'Yes' : 'No'}</p>
          </div>
        )}

        {canEditDefault && (
          <fieldset disabled={loading}>
            <legend>Edit default value</legend>

            <label htmlFor="default-expression">QGIS expression</label>
            <textarea
              id="default-expression"
              rows={3}
              value={expressionDraft}
              onChange={(event) => {
                setExpressionDraft(event.target.value)
                setSaveMessage('')
              }}
            />

            <label>
              <input
                type="checkbox"
                checked={applyOnUpdateDraft}
                onChange={(event) => {
                  setApplyOnUpdateDraft(event.target.checked)
                  setSaveMessage('')
                }}
              />
              Apply when a feature is updated
            </label>

            <button
              type="button"
              disabled={!expressionDraft.trim()}
              onClick={() => applyFieldDefault(expressionDraft, applyOnUpdateDraft)}
            >
              Apply default
            </button>

            <button
              type="button"
              disabled={defaultRule === null}
              onClick={() => applyFieldDefault('', false)}
            >
              Clear default
            </button>
          </fieldset>
        )}

        {saveMessage && <p role="status">{saveMessage}</p>}
    </section>
  )
}

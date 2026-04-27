import { useState } from 'react'
import { spacing } from '../tokens';
import { usePatch } from '../fm-canvas/patch-context';
import { loadLibrary } from '../fm-canvas/patch-storage';
import { SaveButton } from './SaveButton';
import { PopUpModal } from './PresetSaveModal/PresetSaveModal';
import { PresetNavigator } from './PresetNavigator';

export function PresetSelect() {
  const { dispatch } = usePatch()
  const [presetIndex, setPresetIndex] = useState<number>(0)
  const [isSaving, setIsSaving] = useState(false)
  const [presets, setPresets] = useState(() => loadLibrary())

  const handleNavigate = (direction: 1 | -1) => {
    if (direction === -1 && presetIndex === 0) return
    if (direction === 1 && presetIndex === presets.length - 1) return
    const newIndex = presetIndex + direction
    setPresetIndex(newIndex)
    dispatch({ type: 'LOAD_PATCH', patch: presets[newIndex].patch })
  }

  const handleClose = () => {
    setPresets(loadLibrary())
    setIsSaving(false)
  }

  return (
    <div style={{ gridRow: '1 / 3', display: 'flex', justifyItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'row', gap: spacing.md, justifyContent: 'center', alignItems: 'center' }}>
        <PresetNavigator presets={presets} presetIndex={presetIndex} onNavigate={handleNavigate} />
        <SaveButton onOpen={() => setIsSaving(true)} />
        {isSaving && <PopUpModal onClose={handleClose} />}
      </div>
    </div>
  )
}

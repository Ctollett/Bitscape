import { useState, useRef } from 'react'
import { spacing } from '../tokens';
import { usePatch } from '../fm-canvas/patch-context';
import { loadLibrary, deleteFromLibrary, renameInLibrary, exportPatchFile, importPatchFile, saveToLibrary } from '../fm-canvas/patch-storage';
import { createInitialPatch } from '../fm-canvas/constants';
import { SaveButton } from './SaveButton';
import { PopUpModal, RenameModal } from './PresetSaveModal/PresetSaveModal';
import { PresetNavigator } from './PresetNavigator';

export function PresetSelect() {
  const { patch, dispatch } = usePatch()
  const [presetIndex, setPresetIndex] = useState<number>(0)
  const [isSaving, setIsSaving] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [presets, setPresets] = useState(() => loadLibrary())
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentPreset = presets[presetIndex] ?? null

  const handleNavigate = (direction: 1 | -1) => {
    if (direction === -1 && presetIndex === 0) return
    if (direction === 1 && presetIndex === presets.length - 1) return
    const newIndex = presetIndex + direction
    setPresetIndex(newIndex)
    dispatch({ type: 'LOAD_PATCH', patch: presets[newIndex].patch })
  }

  const handleSaveClose = () => {
    const updated = loadLibrary()
    setPresets(updated)
    setPresetIndex(updated.length - 1)
    setIsSaving(false)
  }

  const handleMenuSelect = (value: string) => {
    switch (value) {
      case 'Save as':
        setIsSaving(true)
        break
      case 'Delete': {
        if (!currentPreset) return
        deleteFromLibrary(currentPreset.id)
        const updated = loadLibrary()
        setPresets(updated)
        const newIdx = Math.max(0, presetIndex - 1)
        setPresetIndex(newIdx)
        if (updated.length > 0) dispatch({ type: 'LOAD_PATCH', patch: updated[newIdx].patch })
        break
      }
      case 'Rename':
        if (currentPreset) setIsRenaming(true)
        break
      case 'Export':
        exportPatchFile(patch, currentPreset?.name ?? 'patch')
        break
      case 'Import':
        fileInputRef.current?.click()
        break
      case 'Init':
        dispatch({ type: 'LOAD_PATCH', patch: createInitialPatch() })
        break
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const imported = await importPatchFile(file)
      const name = file.name.replace(/\.json$/, '')
      const saved = saveToLibrary(name, imported, 'other')
      const updated = loadLibrary()
      setPresets(updated)
      const idx = updated.findIndex(p => p.id === saved.id)
      setPresetIndex(idx >= 0 ? idx : 0)
      dispatch({ type: 'LOAD_PATCH', patch: imported })
    } catch { /* invalid file */ }
    e.target.value = ''
  }

  const handleRename = (name: string) => {
    if (!currentPreset) return
    renameInLibrary(currentPreset.id, name)
    setPresets(loadLibrary())
    setIsRenaming(false)
  }

  return (
    <div style={{ gridRow: '1 / 3', display: 'flex', justifyItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'row', gap: spacing.md, justifyContent: 'center', alignItems: 'center' }}>
        <PresetNavigator presets={presets} presetIndex={presetIndex} onNavigate={handleNavigate} />
        <SaveButton onOpen={() => setIsSaving(true)} onMenuSelect={handleMenuSelect} />
        {isSaving && <PopUpModal onClose={handleSaveClose} />}
        {isRenaming && currentPreset && (
          <RenameModal initialName={currentPreset.name} onClose={() => setIsRenaming(false)} onRename={handleRename} />
        )}
        <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
      </div>
    </div>
  )
}

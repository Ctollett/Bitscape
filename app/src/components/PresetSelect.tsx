import { useState } from 'react'
import LeftArrow from '../assets/svgs/left-arrow.svg?react';
import RightArrow from '../assets/svgs/right-arrow.svg?react';
import { spacing, typography, colors, borderRadius } from '../tokens';
import { usePatch } from '../fm-canvas/patch-context';
import { loadLibrary, saveToLibrary } from '../fm-canvas/patch-storage';

const categories = ['Bass', 'Lead', 'Pad', 'Keys', 'Pluck', 'Bell', 'Brass', 'Strings', 'Arp', 'Sequence', 'FX', 'Drum', 'Other']

export function PresetSelect() {

  const { patch, dispatch } = usePatch()
  const [presetIndex, setPresetIndex] = useState<number>(0)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [presets, setPresets] = useState(() => loadLibrary())
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Bass')

  const handlePresets = (direction: 1 | -1) => {

    if(direction == -1 && presetIndex == 0) return
    if(direction == 1 && presets.length - 1 == presetIndex) return
    const newIndex = presetIndex + direction
    setPresetIndex(newIndex)
    dispatch({ type: 'LOAD_PATCH', patch:  presets[newIndex].patch})

  }

  const handleSavePreset = () => {
    setIsSaving(true)
  }

  const handleSaveConfirm = () => {
    console.log(name, category) 
    console.log(category)
    saveToLibrary(name, patch, category)
    setPresets(loadLibrary())
    setIsSaving(false)
    setName('')
    setCategory('')
    console.log(name)
    console.log(setPresets(loadLibrary()))

  }
  

  return (
    <div style={{ gridRow: '1 / 3', display: 'grid', gridTemplateRows: 'subgrid', alignItems: 'center', justifyItems: 'center' }}>
      {/* Row 1: pill */}
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <button onClick={() => handlePresets(-1)} style={{ backgroundColor: 'transparent', border: 'none', padding: 0, margin: 0, lineHeight: 1, display: 'flex' }}><LeftArrow /></button>
        <span style={{...typography.label.lg, width: '84px', height: '28px', borderRadius: borderRadius.md, display: 'flex', justifyContent: 'center', alignItems: 'center',color: colors.text.secondary}}>{presets.length > 0 ? presets[presetIndex].name : 'No Presets'}</span>
        <button onClick={() => handlePresets(1)}style={{ backgroundColor: 'transparent', border: 'none', padding: 0, margin: 0, lineHeight: 1, display: 'flex' }}><RightArrow /></button>
      </div>
      {/* Row 2: category + dots */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing.xs }}>
        <span style={{ ...typography.label.sm, lineHeight: 1 }}>{presets.length ? presets[presetIndex].category : ''}</span>
        <span style={{ ...typography.label.sm, lineHeight: 1 }}>•••</span>
      </div>
      {isSaving ? (
         <form onSubmit={() => handleSaveConfirm()}>
          <div>
            <label htmlFor='presetName'>Preset Name</label>
            <input
            type='text'
            id='presetName'
            name='presetName'
            value={name}
            onChange={(e) => setName(e.target.value)}
            />
          <div>
          <label htmlFor='categoryName'>Category Select</label>
          <select
          id='presetCategory'
          name='presetCategory'
          value={category}
          onChange={(e) => setCategory(e.target.value)}          
          >
          
          {categories.map((cat, index) => (
            <option key={index} value={cat}>
              {cat}
            </option>
            
          ))}
            

          </select>
          </div>

          </div>
          <button type='submit'>Submit</button>
         </form>
      ) : (
         <button onClick={() => handleSavePreset()}>Save Preset</button>
      )}
      
    </div>
  );
}

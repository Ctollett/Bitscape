import './PresetSaveModal.css';
import ModalDot from '../../assets/svgs/modal-dot.svg?react';
import SaveIcon from '../../assets/svgs/save.svg?react';
import XIcon from '../../assets/svgs/lucide/x.svg?react';
import Dropdown from '../UI/Dropdown/Dropdown';
import type { Option } from '../../fm-canvas/types';
import { useState } from 'react';



export function PopUpModal() {

const [category, setSelectedCategory] = useState<Option | null>(null)

const categories: Option[] = [
  { value: 'bass', label: 'Bass' },
  { value: 'lead', label: 'Lead' },
  { value: 'pad', label: 'Pad' },
  { value: 'keys', label: 'Keys' },
  { value: 'pluck', label: 'Pluck' },
  { value: 'bell', label: 'Bell' },
  { value: 'brass', label: 'Brass' },
  { value: 'strings', label: 'Strings' },
  { value: 'arp', label: 'Arp' },
  { value: 'sequence', label: 'Sequence' },
  { value: 'fx', label: 'FX' },
  { value: 'drum', label: 'Drum' },
  { value: 'other', label: 'Other' },
];

const handleSelect = (option:Option) => {
setSelectedCategory(option)


}



  return (
    <div className="modal">
      <div className="modal-content">
        <div className='modal-dots-top'>
        <span><ModalDot /></span>
        <span><ModalDot /></span>
        </div>
      <div className='modal-form-section'>
        <div className='modal-title'>
          <span>SAVE NEW PRESET</span>
          <span><XIcon/></span>
        </div>
        <div className='modal-input'>
        <div>
          <input placeholder="Enter Preset Name" type='name' name='name'></input>
          <div><Dropdown onChange={handleSelect} options={categories} placeholder="Select Category"></Dropdown></div>
        </div>
      <div className='modal-button-section'>
        <button>CANCEL</button>
        <button>SAVE</button>
      </div>
        </div>
      </div>
        <div className='modal-dots-bottom'>
        <span><ModalDot /></span>
        <span><ModalDot /></span>
        </div>
        </div>
    </div>
  );
}

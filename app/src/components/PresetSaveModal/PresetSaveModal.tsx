import './PresetSaveModal.css';
import ModalDot from '../../assets/svgs/modal-dot.svg?react';
import SaveIcon from '../../assets/svgs/save.svg?react';
import XIcon from '../../assets/svgs/lucide/x.svg?react';


export function PopUpModal() {

  const categories = ['Bass', 'Lead', 'Pad', 'Keys', 'Pluck', 'Bell', 'Brass', 'Strings', 'Arp', 'Sequence', 'FX', 'Drum', 'Other']


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
        <form>
          <input placeholder="Enter Preset Name" type='name' name='name'></input>
          <select>
            {categories.map((category) => 
              <option key={category}>{category}</option>
              
            )}
          </select>
      </form>
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

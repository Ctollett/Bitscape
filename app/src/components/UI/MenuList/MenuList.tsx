import type { Option } from '../../../fm-canvas/types';
import './MenuList.css';

interface MenuListProps {
  options: Option[]
  onSelect: (option: Option) => void
}

export function MenuList({ options, onSelect }: MenuListProps) {
  return (
    <ul className="menu-list">
      {options.map((option) => (
        <li key={option.value} onClick={(e) => { e.stopPropagation(); onSelect(option); }}>
          {option.label}
        </li>
      ))}
    </ul>
  )
}

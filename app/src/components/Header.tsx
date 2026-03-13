import { Title } from './Title';
import { PresetSelect } from './PresetSelect';
import { MasterOutput } from './MasterOutput';

export function Header() {
  return (
    <div>
      {/* Logo row */}
      {/* Divider */}
      <hr />
      {/* Main row: Title | PresetSelect | MasterOutput */}
      <div>
        <Title />
        <PresetSelect />
        <MasterOutput />
      </div>
    </div>
  );
}

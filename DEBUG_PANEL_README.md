# Mod Depth Debug Panel

## Overview
A real-time debugging panel has been added to visualize and monitor modulation depths as you interact with the FM Canvas.

## What Was Added

### 1. ModDepthDebugPanel Component
- **File**: `app/src/fm-canvas/ModDepthDebugPanel.tsx`
- **Styling**: `app/src/fm-canvas/mod-depth-debug.css`

### 2. Features

#### Real-Time Monitoring
- **Group A (Operators 0-1)**: Shows all connections from operators 0 and 1
- **Group B (Operators 2-3)**: Shows all connections from operators 2 and 3
- Updates instantly as you move operators or create/remove connections

#### Visual Feedback
- **Distance Display**: Shows pixel distance for each connection
- **Depth Indicator**: Color-coded bar showing modulation depth (0-127)
  - Red → Yellow → Green gradient based on strength
- **Final Mod Depth**: Shows the computed modDepthA and modDepthB values (0-127)

#### Debug Information
- Average distance for each group
- Total number of active connections
- Decay constant and canvas size constants

### 3. Toggle Button
A button in the top-right corner lets you show/hide the debug panel:
- **🐛 Show Debug**: Display the panel
- **🐛 Hide Debug**: Hide the panel
- **Keyboard Shortcut**: Press `d` to quickly toggle the panel
- Default: Panel is visible on load

## How to Use

1. **Start your development server** (if not already running)
   ```bash
   cd app
   npm run dev
   ```

2. **Open the FM Canvas** in your browser

3. **Create connections** between operators by dragging from one operator to another

4. **Move operators** around the canvas and watch:
   - Distance values update in real-time
   - Depth indicators change length and color
   - Average distances recalculate
   - Final modDepthA/modDepthB values update

5. **Toggle the panel** using the button in the top-right if you need more screen space

## Understanding the Values

### Distance → Depth Mapping
The system uses exponential decay to map distance to modulation depth:
```
depth = 127 × e^(-distance / DECAY_CONSTANT)
```

**Examples:**
- Touching (0px) → depth = 127 (maximum)
- ~200px apart → depth ≈ 47
- ~400px apart → depth ≈ 17

### Group Assignments
- **modDepthA**: Average depth of connections from operators 0 or 1
- **modDepthB**: Average depth of connections from operators 2 or 3

### Color Coding
- **Green**: High modulation depth (close together)
- **Yellow**: Medium modulation depth
- **Red**: Low modulation depth (far apart)

## Technical Details

The debug panel mirrors the exact calculations from `depth-mapper.ts`:
1. Filters out self-loop connections
2. Groups connections by source operator (0-1 vs 2-3)
3. Calculates Euclidean distance for each connection
4. Converts distance to depth using exponential decay
5. Averages distances within each group
6. Displays final computed modDepthA and modDepthB

## Files Modified/Created

### Created:
- `app/src/fm-canvas/ModDepthDebugPanel.tsx` - Debug panel component
- `app/src/fm-canvas/mod-depth-debug.css` - Styling for debug panel

### Modified:
- `app/src/fm-canvas/FMCanvas.tsx` - Added debug panel and toggle button

## Future Enhancements (Optional)

Consider adding:
- Graphical representation of the exponential decay curve
- Historical tracking of depth values over time
- Click-to-highlight specific connections on the canvas
- Export debug data to JSON for analysis
- Adjustable decay constant with live preview

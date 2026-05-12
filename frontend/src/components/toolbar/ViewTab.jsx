const ZOOM_LEVELS = [50, 75, 90, 100, 110, 125, 150, 200];

/**
 * @param {{
 *   zoom: number,
 *   onZoomChange: (zoom: number) => void,
 *   showNavigator: boolean,
 *   onToggleNavigator: () => void,
 *   showComments: boolean,
 *   onToggleComments: () => void,
 * }} props
 */
export default function ViewTab({ zoom, onZoomChange, showNavigator, onToggleNavigator, showComments, onToggleComments }) {
  return (
    <div className="toolbar-tab toolbar-view">
      {/* Zoom */}
      <label className="toolbar-label">Zoom</label>
      <select
        className="toolbar-select toolbar-select--sm"
        value={zoom}
        onChange={(e) => onZoomChange(Number(e.target.value))}
        title="Zoom level"
      >
        {ZOOM_LEVELS.map((z) => (
          <option key={z} value={z}>{z}%</option>
        ))}
      </select>

      <div className="toolbar-divider" />

      <button
        className={`toolbar-btn${showNavigator ? ' toolbar-btn--active' : ''}`}
        onClick={onToggleNavigator}
        title="Toggle navigator"
      >
        🗂 Navigator
      </button>

      <button
        className={`toolbar-btn${showComments ? ' toolbar-btn--active' : ''}`}
        onClick={onToggleComments}
        title="Toggle comments panel"
      >
        💬 Comments
      </button>
    </div>
  );
}

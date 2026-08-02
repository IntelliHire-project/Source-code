import React, { useEffect, useRef, useState } from 'react';
import './DropdownMenu.css';

/**
 * DropdownMenu — dark-theme ⋮ actions menu.
 *
 * The trigger is a real <button> and every menu item is a real
 * <button role="menuitem">. All clicks inside stopPropagation so the
 * menu never bubbles into a surrounding clickable row/link.
 *
 * @param {ReactNode} trigger - trigger content (icon, label)
 * @param {string} ariaLabel - accessible name for the trigger button
 * @param {Array} items - [{ label, icon?, onClick?, danger? }]
 * @param {'right'|'left'} [align] - panel alignment
 */
function DropdownMenu({ trigger, ariaLabel, items = [], align = 'right' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onDocMouseDown(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }
    function onDocKeyDown(event) {
      if (event.key === 'Escape') setOpen(false);
    }
    if (open) {
      document.addEventListener('mousedown', onDocMouseDown);
      document.addEventListener('keydown', onDocKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onDocKeyDown);
    };
  }, [open]);

  return (
    <div
      className={`dropdown-menu-wrap ${align === 'left' ? 'dropdown-menu-wrap--left' : ''}`}
      ref={ref}
    >
      <button
        type="button"
        className="dropdown-menu-trigger"
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((prev) => !prev);
        }}
      >
        {trigger}
      </button>
      {open && (
        <div className="dropdown-menu-panel" role="menu">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                className={`dropdown-menu-item ${item.danger ? 'dropdown-menu-item--danger' : ''}`}
                onClick={(event) => {
                  event.stopPropagation();
                  setOpen(false);
                  if (item.onClick) item.onClick();
                }}
              >
                {Icon && <Icon size={15} />}
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default DropdownMenu;

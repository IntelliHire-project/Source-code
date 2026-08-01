import React, { useState, useRef, useCallback } from 'react';
import { X } from 'lucide-react';

function TagInput({ tags = [], onChange, placeholder = 'Type and press Enter…', maxTags }) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  const addTag = useCallback(
    (value) => {
      const trimmed = value.trim();
      if (!trimmed) return;
      if (tags.includes(trimmed)) return;
      if (maxTags && tags.length >= maxTags) return;
      onChange([...tags, trimmed]);
      setInputValue('');
    },
    [tags, onChange, maxTags],
  );

  const removeTag = useCallback(
    (index) => {
      onChange(tags.filter((_, i) => i !== index));
    },
    [tags, onChange],
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div className="tag-input" onClick={() => inputRef.current?.focus()}>
      <div className="tag-input__chips">
        {tags.map((tag, i) => (
          <span key={tag} className="tag-input__chip">
            {tag}
            <button
              type="button"
              className="tag-input__chip-remove"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(i);
              }}
              aria-label={`Remove ${tag}`}
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          className="tag-input__field"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (inputValue.trim()) addTag(inputValue);
          }}
          placeholder={tags.length === 0 ? placeholder : ''}
          aria-label="Add a skill"
        />
      </div>
    </div>
  );
}

export default TagInput;

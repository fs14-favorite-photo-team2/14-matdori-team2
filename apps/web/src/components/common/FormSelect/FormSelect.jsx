'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import styles from './FormSelect.module.css'

export default function FormSelect({
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef(null)

  const selectedOption = options.find((option) => option.value === value)

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleToggle() {
    if (disabled || options.length === 0) return
    setIsOpen((prev) => !prev)
  }

  function handleSelect(optionValue) {
    onChange(optionValue)
    setIsOpen(false)
  }

  const isDisabled = disabled || options.length === 0

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        type="button"
        className={`${styles.trigger} ${isDisabled ? styles.disabled : ''}`}
        onClick={handleToggle}
        disabled={isDisabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={selectedOption ? styles.value : styles.placeholder}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <Image
          src="/icons/drop-down.svg"
          alt=""
          width={16}
          height={16}
          className={isOpen ? styles.arrowOpen : ''}
        />
      </button>

      {isOpen && (
        <ul className={styles.optionList} role="listbox">
          {options.map((option) => (
            <li
              key={option.value}
              role="option"
              aria-selected={option.value === value}
              className={`${styles.option} ${option.value === value ? styles.optionSelected : ''}`}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

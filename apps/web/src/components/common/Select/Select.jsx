'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import styles from './Select.module.css'

export default function Select({
  options = [],
  value,
  onChange,
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const selectRef = useRef(null)

  const isDisabled = disabled || options.length === 0
  const selectedOption = options.find((option) => option.value === value)

  const handleToggle = () => {
    if (isDisabled) return

    setIsOpen((prev) => !prev)
  }

  const handleSelect = (optionValue) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  useEffect(() => {
    if (!isOpen) return

    const handleOutsideClick = (event) => {
      if (!selectRef.current?.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('pointerdown', handleOutsideClick)

    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick)
    }
  }, [isOpen])

  return (
    <div ref={selectRef} className={styles.select}>
      <button
        type="button"
        className={styles.trigger}
        onClick={handleToggle}
        disabled={isDisabled}
        aria-expanded={isOpen && !isDisabled}
      >
        <span>{selectedOption?.label ?? ''}</span>

        <Image
          src={isOpen ? '/icons/arrow-up.png' : '/icons/arrow-down.png'}
          alt=""
          width={24}
          height={24}
        />
      </button>

      {isOpen && !isDisabled && (
        <ul className={styles.options}>
          {options.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                className={styles.option}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

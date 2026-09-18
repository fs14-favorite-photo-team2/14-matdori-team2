'use client'

import Image from 'next/image'
import styles from './SearchBar.module.css'

export default function SearchBar({
  value = '',
  onChange,
  onSearch,
  placeholder = '검색',
}) {
  const handleChange = (event) => {
    onChange?.(event.target.value)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSearch?.(value.trim())
  }

  return (
    <form className={styles.searchBar} role="search" onSubmit={handleSubmit}>
      <input
        className={styles.input}
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        aria-label={placeholder}
      />
      <button
        className={styles.searchButton}
        type="submit"
        aria-label={placeholder}
      >
        <Image src="/icons/search.svg" alt="" width={22} height={22} />
      </button>
    </form>
  )
}

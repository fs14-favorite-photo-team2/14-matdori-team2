'use client'

import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import {
  DEFAULT_FILTERS,
  MARKETPLACE_FILTER_GROUPS,
} from '@/constants/RecipeOptions'
import styles from './RecipeFilter.module.css'

export default function RecipeFilter({
  filterGroups = MARKETPLACE_FILTER_GROUPS,
  filters = DEFAULT_FILTERS,
  draftFilters = filters, // 모바일 필터 탭에서 선택한 옵션을 임시로 저장하는 상태
  sortOptions = [],
  sort = '',
  isMobileOpen = false,
  counts = {},
  resultCount = 0,
  onFilterChange,
  onDraftFilterChange,
  onSortChange,
  onOpenMobile,
  onCloseMobile,
  onReset,
  onApply,
}) {
  const [openMenu, setOpenMenu] = useState(null)
  // 모바일 필터 탭의 기본값은 난이도
  const [activeTab, setActiveTab] = useState(filterGroups[0]?.key ?? '')
  const activeGroup =
    filterGroups.find((group) => group.key === activeTab) ?? filterGroups[0]
  const filterRef = useRef(null)

  const toggleMenu = (menuKey) => {
    setOpenMenu((currentMenu) => (currentMenu === menuKey ? null : menuKey))
  }

  const getSelectedLabel = (group) => {
    const selectedOption = group.options.find(
      (option) => option.value === filters[group.key],
    )

    return selectedOption?.label ?? group.label
  }

  const handleOptionSelect = (groupKey, value) => {
    const nextValue = filters[groupKey] === value ? '' : value

    onFilterChange?.(groupKey, nextValue)
    setOpenMenu(null)
  }

  const handleSortSelect = (value) => {
    onSortChange?.(value)
    setOpenMenu(null)
  }

  const handleOverlayClick = (event) => {
    // 실제 클릭 위치가 overlay 자체일 때만 모달을 닫음
    if (event.target === event.currentTarget) {
      onCloseMobile?.()
    }
  }

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!filterRef.current?.contains(event.target)) {
        setOpenMenu(null)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpenMenu(null)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  useEffect(() => {
    if (!isMobileOpen) {
      return undefined
    }

    const previousOverflow = document.body.style.overflow

    document.body.style.overflow = 'hidden'

    const handleMobileKeyDown = (event) => {
      if (event.key === 'Escape') {
        onCloseMobile?.()
      }
    }

    document.addEventListener('keydown', handleMobileKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleMobileKeyDown)
    }
  }, [isMobileOpen, onCloseMobile])

  return (
    <>
      <div className={styles.filterBar} ref={filterRef}>
        <div className={styles.desktopFilters}>
          {filterGroups.map((group) => (
            <div className={styles.dropDown} key={group.key}>
              <button
                className={styles.filterButton}
                type="button"
                onClick={() => toggleMenu(group.key)}
              >
                <span>{getSelectedLabel(group)}</span>

                <Image
                  className={`${styles.dropDownIcon} ${
                    openMenu === group.key ? styles.dropDownIconOpen : ''
                  }`}
                  src="/icons/drop-down.svg"
                  alt=""
                  width={24}
                  height={24}
                />
              </button>

              {openMenu === group.key && (
                <div className={styles.optionMenu}>
                  {group.options.map((option) => (
                    <button
                      className={`${styles.optionButton} ${
                        filters[group.key] === option.value
                          ? styles.optionButtonSelected
                          : ''
                      }`}
                      type="button"
                      key={option.value}
                      onClick={() =>
                        handleOptionSelect(group.key, option.value)
                      }
                    >
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <button
          className={styles.mobileFilterButton}
          type="button"
          onClick={onOpenMobile}
        >
          <Image
            src="/icons/filter.svg"
            alt="필터 열기"
            width={35}
            height={35}
          />
        </button>

        {sortOptions.length > 0 && (
          <div className={`${styles.dropDown} ${styles.sortDropDown}`}>
            <button
              className={styles.sortButton}
              type="button"
              onClick={() => toggleMenu('sort')}
            >
              <span>
                {sortOptions.find((option) => option.value === sort)?.label ??
                  '정렬'}
              </span>

              <Image
                className={`${styles.dropDownIcon} ${
                  openMenu === 'sort' ? styles.dropDownIconOpen : ''
                }`}
                src="/icons/drop-down.svg"
                alt=""
                width={24}
                height={24}
              />
            </button>

            {openMenu === 'sort' && (
              <div className={styles.optionMenu}>
                {sortOptions.map((option) => (
                  <button
                    className={`${styles.optionButton} ${
                      sort === option.value ? styles.optionButtonSelected : ''
                    }`}
                    type="button"
                    key={option.value}
                    onClick={() => handleSortSelect(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {isMobileOpen && (
        <div className={styles.overlay} onClick={handleOverlayClick}>
          {/* 화면 읽기 도구에 현재 영역이 모달임을 알려줌 */}
          <section
            className={styles.bottomSheet}
            role="dialog"
            aria-modal="true"
          >
            <header className={styles.sheetHeader}>
              <h2>필터</h2>

              <button
                className={styles.closeButton}
                type="button"
                onClick={onCloseMobile}
              >
                <Image
                  src="/icons/close.svg"
                  alt="필터 닫기"
                  width={24}
                  height={24}
                />
              </button>
            </header>
            <div className={styles.tabs}>
              {filterGroups.map((group) => (
                <button
                  className={`${styles.tabButton} ${
                    activeTab === group.key ? styles.tabButtonActive : ''
                  }`}
                  type="button"
                  key={group.key}
                  onClick={() => setActiveTab(group.key)}
                >
                  {group.label}
                </button>
              ))}
            </div>
            <div className={styles.mobileOptions}>
              {activeGroup?.options.map((option) => (
                <button
                  className={`${styles.mobileOption} ${
                    draftFilters[activeGroup.key] === option.value
                      ? styles.mobileOptionSelected
                      : ''
                  } ${option.tone ? styles[option.tone] : ''}`}
                  type="button"
                  key={option.value}
                  onClick={() =>
                    onDraftFilterChange?.(activeGroup.key, option.value)
                  }
                >
                  <span>{option.label}</span>

                  {counts[activeGroup.key]?.[option.value] !== undefined && (
                    <span className={styles.optionCount}>
                      {counts[activeGroup.key][option.value]}개
                    </span>
                  )}
                </button>
              ))}
            </div>
            <footer className={styles.sheetFooter}>
              <button
                className={styles.resetButton}
                type="button"
                onClick={onReset}
              >
                <Image
                  src="/icons/reset.svg"
                  alt="필터 초기화"
                  width={28}
                  height={28}
                />
              </button>

              <button
                className={styles.applyButton}
                type="button"
                onClick={() => onApply?.(draftFilters)}
              >
                {resultCount}개 레시피 보기
              </button>
            </footer>
          </section>
        </div>
      )}
    </>
  )
}

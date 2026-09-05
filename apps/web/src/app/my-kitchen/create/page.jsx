'use client'

import { useState } from 'react'
import Button from '@/components/common/Button/Button'
import FormSelect from '@/components/common/FormSelect/FormSelect'
import ImageUploader from '@/components/common/ImageUploader/ImageUploader'
import { DIFFICULTY_OPTIONS, CATEGORY_OPTIONS } from '@/constants/RecipeOptions'
import styles from './page.module.css'

const MAX_SUPPLY = 10

export default function CreateRecipePage() {
  const [title, setTitle] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [category, setCategory] = useState('')
  const [totalSupply, setTotalSupply] = useState('')
  const [summary, setSummary] = useState('')
  const [content, setContent] = useState('')
  const [imageFiles, setImageFiles] = useState([])

  const isSupplyValid =
    totalSupply !== '' &&
    Number(totalSupply) > 0 &&
    Number(totalSupply) <= MAX_SUPPLY

  const isFormValid =
    title.trim() !== '' &&
    difficulty !== '' &&
    category !== '' &&
    isSupplyValid &&
    imageFiles.length > 0 &&
    summary.trim() !== '' &&
    content.trim() !== ''

  function handleSubmit(event) {
    event.preventDefault()
    if (!isFormValid) return
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>레시피 생성</h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="title">
            레시피 이름
          </label>
          <input
            id="title"
            className={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="레시피 이름을 입력해 주세요"
          />
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>난이도</label>
            <FormSelect
              options={DIFFICULTY_OPTIONS}
              value={difficulty}
              onChange={setDifficulty}
              placeholder="난이도을 선택해 주세요"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>카테고리</label>
            <FormSelect
              options={CATEGORY_OPTIONS}
              value={category}
              onChange={setCategory}
              placeholder="카테고리를 선택해 주세요"
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="totalSupply">
            총 발행량
          </label>
          <input
            id="totalSupply"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className={`${styles.input} ${totalSupply !== '' && !isSupplyValid ? styles.inputError : ''}`}
            value={totalSupply}
            onChange={(e) => {
              const onlyNums = e.target.value.replace(/[^0-9]/g, '')
              setTotalSupply(onlyNums)
            }}
            placeholder="총 발행량을 입력해 주세요"
          />
          {totalSupply !== '' && !isSupplyValid && (
            <p className={styles.errorText}>
              총 발행량은 10장 이하로 선택 가능합니다.
            </p>
          )}
        </div>

        <div className={styles.field}>
          <span className={styles.label}>사진 업로드</span>
          <ImageUploader onChange={setImageFiles} />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="summary">
            요리 소개
          </label>
          <textarea
            id="summary"
            className={styles.textarea}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="요리에 대한 설명을 입력해 주세요"
            rows={4}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="content">
            레시피 상세
          </label>
          <textarea
            id="content"
            className={styles.textarea}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="상세 레시피를 입력해 주세요"
            rows={6}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          className={styles.submitButton}
          disabled={!isFormValid}
        >
          생성하기
        </Button>
      </form>
    </div>
  )
}

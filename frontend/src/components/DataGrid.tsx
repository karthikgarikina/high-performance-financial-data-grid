import {
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import type { Transaction } from '../App'

interface Props {
  data: Transaction[]
}

type SortKey = keyof Transaction | null
type SortDirection = 'asc' | 'desc'

const ROW_HEIGHT = 44
const VIEWPORT_HEIGHT = 600
const BUFFER = 10

export default function DataGrid({ data }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  const [scrollTop, setScrollTop] = useState(0)
  const [fps, setFps] = useState(0)

  const [internalData, setInternalData] = useState<Transaction[]>(data)

  const [sortKey, setSortKey] = useState<SortKey>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const [merchantFilter, setMerchantFilter] = useState('')
  const [debouncedFilter, setDebouncedFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())

  const [editingCell, setEditingCell] = useState<{
    rowIndex: number
    key: keyof Transaction
  } | null>(null)

  useEffect(() => {
    setInternalData(data)
  }, [data])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilter(merchantFilter)
    }, 300)
    return () => clearTimeout(timer)
  }, [merchantFilter])

  const processedData = useMemo(() => {
    let result = internalData

    if (debouncedFilter) {
      result = result.filter(row =>
        row.merchant
          .toLowerCase()
          .includes(debouncedFilter.toLowerCase())
      )
    }

    if (statusFilter) {
      result = result.filter(row => row.status === statusFilter)
    }

    if (sortKey) {
      result = [...result].sort((a, b) => {
        const valA = a[sortKey]
        const valB = b[sortKey]

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc'
            ? valA - valB
            : valB - valA
        }

        return sortDirection === 'asc'
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA))
      })
    }

    return result
  }, [internalData, debouncedFilter, statusFilter, sortKey, sortDirection])

  const totalHeight = processedData.length * ROW_HEIGHT
  const visibleCount = Math.ceil(VIEWPORT_HEIGHT / ROW_HEIGHT)

  const startIndex = Math.max(
    0,
    Math.floor(scrollTop / ROW_HEIGHT) - BUFFER
  )

  const endIndex = Math.min(
    processedData.length,
    startIndex + visibleCount + BUFFER * 2
  )

  const visibleRows = processedData.slice(startIndex, endIndex)
  const offsetY = startIndex * ROW_HEIGHT

  const handleSort = (key: keyof Transaction) => {
    if (sortKey === key) {
      setSortDirection(prev =>
        prev === 'asc' ? 'desc' : 'asc'
      )
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  const handleRowClick = (
    e: React.MouseEvent,
    id: number
  ) => {
    if (e.ctrlKey || e.metaKey) {
      setSelectedRows(prev => {
        const newSet = new Set(prev)
        if (newSet.has(id)) newSet.delete(id)
        else newSet.add(id)
        return newSet
      })
    } else {
      setSelectedRows(new Set([id]))
    }
  }

  const handleCellEdit = (
    rowIndex: number,
    key: keyof Transaction,
    value: string
  ) => {
    setInternalData(prev => {
      const newData = [...prev]
      const target = processedData[rowIndex]
      const realIndex = prev.findIndex(
        r => r.id === target.id
      )
      newData[realIndex] = {
        ...newData[realIndex],
        [key]:
          key === 'amount'
            ? Number(value)
            : value
      }
      return newData
    })
    setEditingCell(null)
  }

  useEffect(() => {
    let frameCount = 0
    let lastTime = performance.now()
    let animationFrameId: number

    const measure = () => {
      const now = performance.now()
      frameCount++
      if (now >= lastTime + 1000) {
        setFps(frameCount)
        frameCount = 0
        lastTime = now
      }
      animationFrameId = requestAnimationFrame(measure)
    }

    animationFrameId = requestAnimationFrame(measure)
    return () =>
      cancelAnimationFrame(animationFrameId)
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      requestAnimationFrame(() =>
        setScrollTop(container.scrollTop)
      )
    }

    container.addEventListener('scroll', handleScroll)
    return () =>
      container.removeEventListener(
        'scroll',
        handleScroll
      )
  }, [])

  const pinnedClass = 'pinned-column'
  const sortIndicator = (key: keyof Transaction) => {
    if (sortKey !== key) return ''
    return sortDirection === 'asc' ? ' ↑' : ' ↓'
  }

  const getStatusClass = (status: Transaction['status']) => {
    if (status === 'Completed') return 'status-completed'
    if (status === 'Pending') return 'status-pending'
    return 'status-failed'
  }

  return (
    <div className="data-grid-shell">
      {/* FILTERS */}
      <div className="dg-toolbar">
        <div className="dg-toolbar-title-wrap">
          <h2 className="dg-title">Financial Transactions</h2>
          <p className="dg-subtitle">
            Filter, sort, multi-select with Ctrl/Cmd, and double-click any cell to edit.
          </p>
        </div>

        <input
          data-test-id="filter-merchant"
          placeholder="Filter by Merchant..."
          value={merchantFilter}
          onChange={e => setMerchantFilter(e.target.value)}
          className="dg-input"
        />

        <button
          data-test-id="quick-filter-Completed"
          onClick={() => setStatusFilter('Completed')}
          className={`dg-button ${statusFilter === 'Completed' ? 'active' : ''}`}
        >
          Completed
        </button>

        <button
          data-test-id="quick-filter-Pending"
          onClick={() => setStatusFilter('Pending')}
          className={`dg-button ${statusFilter === 'Pending' ? 'active' : ''}`}
        >
          Pending
        </button>

        <button
          onClick={() => setStatusFilter(null)}
          className="dg-button dg-button-clear"
        >
          Clear
        </button>

        <span
          data-test-id="filter-count"
          className="dg-count"
        >
          Showing {processedData.length} of {internalData.length} rows
        </span>
      </div>

      {/* HEADER */}
      <div className="dg-header-row">
        <div
          data-test-id="header-id"
          data-test-id-pin="pin-column-id"
          onClick={() => handleSort('id')}
          className={`${pinnedClass} dg-header-cell dg-sortable`}
          style={{ width: 80, position: 'sticky', left: 0, zIndex: 5 }}
        >
          ID{sortIndicator('id')}
        </div>

        <div
          onClick={() => handleSort('date')}
          className={`${pinnedClass} dg-header-cell dg-sortable`}
          style={{ width: 220, position: 'sticky', left: 80, zIndex: 5 }}
        >
          Date{sortIndicator('date')}
        </div>

        <div className="dg-header-cell" style={{ width: 160 }}>
          Merchant
        </div>
        <div className="dg-header-cell" style={{ width: 150 }}>
          Category
        </div>

        <div
          data-test-id="header-amount"
          onClick={() => handleSort('amount')}
          className="dg-header-cell dg-sortable"
          style={{ width: 120 }}
        >
          Amount{sortIndicator('amount')}
        </div>

        <div className="dg-header-cell" style={{ width: 120 }}>
          Status
        </div>
        <div className="dg-header-cell" style={{ flex: 1 }}>
          Description
        </div>
      </div>

      {/* GRID */}
      <div
        data-test-id="grid-scroll-container"
        ref={containerRef}
        className="dg-scroll-container"
        style={{ height: VIEWPORT_HEIGHT, overflow: 'auto' }}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div
            data-test-id="grid-row-window"
            style={{ position: 'absolute', width: '100%', transform: `translateY(${offsetY}px)` }}
          >
            {visibleRows.map((row, i) => {
              const absoluteIndex = startIndex + i
              const isSelected = selectedRows.has(row.id)
              const rowBackground = isSelected
                ? '#e7f0ff'
                : absoluteIndex % 2
                ? '#f9fbff'
                : '#ffffff'

              return (
                <div
                  key={row.id}
                  data-test-id={`virtual-row-${row.id}`}
                  data-selected={isSelected ? 'true' : undefined}
                  onClick={e => handleRowClick(e, row.id)}
                  className={`dg-row ${isSelected ? 'selected' : ''}`}
                  style={{
                    display: 'flex',
                    height: ROW_HEIGHT,
                    background: rowBackground,
                    alignItems: 'center'
                  }}
                >
                  {Object.entries(row).map(([key, value], colIndex) => {
                    const cellKey = key as keyof Transaction
                    const isEditing =
                      editingCell &&
                      editingCell.rowIndex === absoluteIndex &&
                      editingCell.key === cellKey

                    const leftOffset =
                      colIndex === 0
                        ? 0
                        : colIndex === 1
                        ? 80
                        : undefined

                    return (
                      <div
                        key={key}
                        data-test-id={`cell-${absoluteIndex}-${key}`}
                        onDoubleClick={() =>
                          setEditingCell({
                            rowIndex: absoluteIndex,
                            key: cellKey
                          })
                        }
                        className={
                          `${colIndex < 2 ? pinnedClass : ''} dg-cell`
                        }
                        style={{
                          width:
                            colIndex === 0
                              ? 80
                              : colIndex === 1
                              ? 220
                              : colIndex === 2
                              ? 160
                              : colIndex === 3
                              ? 150
                              : colIndex === 4
                              ? 120
                              : colIndex === 5
                              ? 120
                              : undefined,
                          flex:
                            colIndex >= 6 ? 1 : undefined,
                          padding: '0 12px',
                          position:
                            colIndex < 2
                              ? 'sticky'
                              : undefined,
                          left: leftOffset,
                          background:
                            colIndex < 2
                              ? rowBackground
                              : undefined
                        }}
                      >
                        {isEditing ? (
                          <input
                            autoFocus
                            defaultValue={String(value)}
                            className="dg-inline-input"
                            onBlur={e =>
                              handleCellEdit(
                                absoluteIndex,
                                cellKey,
                                e.target.value
                              )
                            }
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                handleCellEdit(
                                  absoluteIndex,
                                  cellKey,
                                  (e.target as HTMLInputElement)
                                    .value
                                )
                              }
                            }}
                          />
                        ) : cellKey === 'status' ? (
                          <span
                            className={`dg-status-pill ${getStatusClass(
                              value as Transaction['status']
                            )}`}
                          >
                            {String(value)}
                          </span>
                        ) : cellKey === 'amount' ? (
                          <span className="dg-amount">{String(value)}</span>
                        ) : (
                          String(value)
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* DEBUG */}
      <div
        data-test-id="debug-panel"
        className="dg-debug"
      >
        <div data-test-id="debug-fps">FPS: {fps}</div>
        <div data-test-id="debug-rendered-rows">
          Rendered Rows: {visibleRows.length}
        </div>
        <div data-test-id="debug-scroll-position">
          Row {startIndex} / {processedData.length}
        </div>
      </div>
    </div>
  )
}
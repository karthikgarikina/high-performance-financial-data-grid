import { useEffect, useState } from 'react'
import DataGrid from './components/DataGrid'

export interface Transaction {
  id: number
  date: string
  merchant: string
  category: string
  amount: number
  status: 'Completed' | 'Pending' | 'Failed'
  description: string
}

function App() {
  const [data, setData] = useState<Transaction[]>([])

  useEffect(() => {
    fetch('/transactions.json')
      .then(res => res.json())
      .then(setData)
  }, [])

  return (
    <div>
      {data.length > 0 && <DataGrid data={data} />}
    </div>
  )
}

export default App
import http from './http'

export const initializeData = async (params) => {
  return await http.post('/data/init-sync', null, { params })
}

export const initializeDataWithProgress = (params, onProgress, onComplete, onError) => {
  const urlParams = new URLSearchParams(params).toString()
  const url = `/api/data/init?${urlParams}`
  
  console.log('正在連接到:', url)
  const eventSource = new EventSource(url)
  
  // 連接開啟時的處理
  eventSource.onopen = (event) => {
    console.log('SSE 連接已開啟:', event)
  }
  
  eventSource.addEventListener('start', (event) => {
    try {
      const data = JSON.parse(event.data)
      console.log('開始:', data.message)
    } catch (e) {
      console.log('開始生成資料...')
    }
  })

  eventSource.addEventListener('progress', (event) => {
    try {
      console.log('收到進度事件:', event.data)
      const data = JSON.parse(event.data)
      onProgress(data)
    } catch (e) {
      console.error('Progress JSON parse error:', e, 'Raw data:', event.data)
      onError({ success: false, message: 'JSON解析錯誤: ' + e.message })
    }
  })
  
  eventSource.addEventListener('heartbeat', (event) => {
    console.log('心跳:', event.data)
  })
  
  eventSource.addEventListener('complete', (event) => {
    try {
      console.log('收到完成事件:', event.data)
      const data = JSON.parse(event.data)
      eventSource.close()
      onComplete(data)
    } catch (e) {
      console.error('Complete JSON parse error:', e, 'Raw data:', event.data)
      eventSource.close()
      onError({ success: false, message: 'JSON解析錯誤: ' + e.message })
    }
  })
  
  eventSource.addEventListener('error', (event) => {
    try {
      console.log('收到錯誤事件:', event.data)
      if (event.data) {
        const data = JSON.parse(event.data)
        eventSource.close()
        onError(data)
      } else {
        eventSource.close()
        onError({ success: false, message: '伺服器錯誤' })
      }
    } catch (e) {
      console.error('Error JSON parse error:', e, 'Raw data:', event.data)
      eventSource.close()
      onError({ success: false, message: 'JSON解析錯誤: ' + e.message })
    }
  })
  
  // 連接錯誤處理
  eventSource.onerror = (event) => {
    console.error('SSE 連接錯誤:', event)
    console.error('ReadyState:', eventSource.readyState)
    
    let errorMessage = '連接中斷'
    
    switch (eventSource.readyState) {
      case EventSource.CONNECTING:
        errorMessage = '正在嘗試連接...'
        return // 不要關閉，讓它重試
      case EventSource.OPEN:
        errorMessage = '連接已開啟但發生錯誤'
        break
      case EventSource.CLOSED:
        errorMessage = '連接已關閉'
        break
      default:
        errorMessage = '未知連接狀態'
    }
    
    eventSource.close()
    onError({ success: false, message: errorMessage })
  }
  
  return eventSource
}

export const getDataInfo = async () => {
  return await http.get('/data/info')
}

export const clearAllData = async () => {
  return await http.delete('/data/clear')
}

export const testSSE = () => {
  const eventSource = new EventSource('/api/data/test-sse')
  
  eventSource.onopen = () => {
    console.log('測試SSE連接已開啟')
  }
  
  eventSource.addEventListener('test', (event) => {
    console.log('測試事件:', JSON.parse(event.data))
  })
  
  eventSource.addEventListener('complete', (event) => {
    console.log('測試完成:', JSON.parse(event.data))
    eventSource.close()
  })
  
  eventSource.onerror = (event) => {
    console.error('測試SSE錯誤:', event)
    console.error('ReadyState:', eventSource.readyState)
    eventSource.close()
  }
  
  return eventSource
}
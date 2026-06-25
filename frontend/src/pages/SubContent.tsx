import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

import apiClient from '../services/api'

function SubContent() {
  const { uuid } = useParams<{ uuid: string }>()
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSubContent = async () => {
      if (!uuid) {
        setError('UUID is required')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await apiClient.get(`/api/get_sub_content?uuid=${uuid}`, {
          responseType: 'text'
        })
        setContent(response.data)
        setError(null)
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to fetch subscription content')
      } finally {
        setLoading(false)
      }
    }

    fetchSubContent()
  }, [uuid])





  // Return pure text without HTML tags or styling
  return content
}

export default SubContent


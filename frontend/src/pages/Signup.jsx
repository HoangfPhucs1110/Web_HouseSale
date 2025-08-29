import { useState } from 'react'
import api from '@/lib/api'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setOk(false)
    try {
      // KHÔNG hash ở FE
      await api.post('/auth/signup', { email, password, name })
      setOk(true)
    } catch (err) {
      setError(err?.response?.data?.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '40px auto', fontFamily: 'system-ui' }}>
      <h2>Sign up</h2>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Name</label>
          <input value={name} onChange={(e)=>setName(e.target.value)} required style={{ width:'100%' }}/>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Email</label>
          <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required style={{ width:'100%' }}/>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Password</label>
          <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required style={{ width:'100%' }}/>
        </div>
        <button disabled={loading} type="submit">
          {loading ? 'Đang đăng ký...' : 'Đăng ký'}
        </button>
      </form>
      {ok && <p style={{ color:'green' }}>Tài khoản đã được tạo. Bạn có thể đăng nhập ngay bây giờ.</p>}
      {error && <p style={{ color:'crimson' }}>{error}</p>}
    </div>
  )
}

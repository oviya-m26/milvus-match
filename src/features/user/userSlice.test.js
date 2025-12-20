import userReducer, { logoutUser } from './userSlice'

describe('userSlice reducer', () => {
  const initialState = {
    isLoading: false,
    uploadLoading: false,
    user: null,
  }

  it('should return the initial state when passed an empty action', () => {
    const result = userReducer(undefined, { type: '' })
    expect(result).toEqual(expect.objectContaining({ isLoading: false }))
  })

  it('should handle logoutUser reducer action', () => {
    const pre = { ...initialState, user: { name: 'Alice' } }
    const action = logoutUser()
    const next = userReducer(pre, action)
    expect(next.user).toBeNull()
  })
})

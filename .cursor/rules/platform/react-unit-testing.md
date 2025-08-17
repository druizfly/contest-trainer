#### React Unit Testing
- **Testing Framework**: Jest
- **React Testing**: React Testing Library (RTL)
- **User Interactions**: @testing-library/user-event
- **Approach**: BDD (Behavior-Driven Development)
- **Fake Timers**: Use by default for consistent testing

##### Testing Principles
- **Test behavior over implementation**
- **Accessible queries**: Prefer `findByRole`, `findByLabelText`, `findByText` over test IDs
- **Keep test IDs**: Don't remove test IDs from implementation (useful for E2E tests)
- **Explicit setup**: Make test arrangements clear and readable

##### React Testing Library Setup
Create a custom render wrapper in `test-utils.tsx`:

```typescript
import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
import userEvent from '@testing-library/user-event'

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  // Add any custom options here (e.g., initial state, providers)
}

const customRender = (
  ui: ReactElement,
  options?: CustomRenderOptions
) => {
  const user = userEvent.setup({ delay: null })
  
  return {
    user,
    ...render(ui, options)
  }
}

export * from '@testing-library/react'
export { customRender as render }
```

##### Fake Timers Configuration
```typescript
beforeEach(() => {
  jest.useFakeTimers()
})

afterEach(() => {
  jest.runOnlyPendingTimers()
  jest.useRealTimers()
})

// Custom timer advancement function
const advanceTimers = async (ms: number) => {
  await act(async () => {
    jest.advanceTimersByTime(ms)
  })
}
```

##### Mocking Example
```typescript
// Mock external dependencies
jest.mock('../services/api', () => ({
  fetchUser: jest.fn(),
  updateUser: jest.fn(),
}))

// Mock with TypeScript support
const mockFetchUser = jest.mocked(fetchUser)

beforeEach(() => {
  mockFetchUser.mockResolvedValue({ id: '1', name: 'John Doe' })
})
```

##### BDD Test Structure
```typescript
describe('UserProfile Component', () => {
  describe('when user data is loaded', () => {
    beforeEach(() => {
      mockFetchUser.mockResolvedValue({ id: '1', name: 'John Doe' })
    })

    it('displays user name', async () => {
      const { user } = render(<UserProfile userId="1" />)
      
      expect(await screen.findByText('John Doe')).toBeInTheDocument()
    })
  })

  describe('when save button is clicked', () => {
    it('calls update API with correct data', async () => {
      const { user } = render(<UserProfile userId="1" />)
      
      const nameInput = screen.getByLabelText('Name')
      const saveButton = screen.getByRole('button', { name: 'Save' })
      
      await user.clear(nameInput)
      await user.type(nameInput, 'Jane Doe')
      await user.click(saveButton)
      
      expect(mockUpdateUser).toHaveBeenCalledWith('1', { name: 'Jane Doe' })
    })
  })
})
```

##### Act Usage Guidelines
Only use `act()` in these specific cases:
- **Advancing fake timers**: State updates from timer advancement
- **useImperativeHandle**: Testing components with imperative handles
- **Custom hooks**: When testing hooks directly

```typescript
// Example: Advancing timers with act
const advanceTimers = async (ms: number) => {
  await act(async () => {
    jest.advanceTimersByTime(ms)
  })
}
```

##### Test Utilities
Create reusable functions for common test scenarios:

```typescript
// Custom helper functions
const setupUserProfile = (overrides = {}) => {
  const defaultProps = {
    userId: '1',
    onSave: jest.fn(),
    ...overrides
  }
  
  return render(<UserProfile {...defaultProps} />)
}

const fillUserForm = async (user: UserEvent, data: Partial<UserData>) => {
  if (data.name) {
    await user.clear(screen.getByLabelText('Name'))
    await user.type(screen.getByLabelText('Name'), data.name)
  }
  if (data.email) {
    await user.clear(screen.getByLabelText('Email'))
    await user.type(screen.getByLabelText('Email'), data.email)
  }
}
```

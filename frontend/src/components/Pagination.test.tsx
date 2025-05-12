import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Pagination } from './Pagination'

describe('Pagination Component', () => {
  it('renders the correct number of page buttons', () => {
    render(
      <Pagination 
        projectsPerPage={10} 
        totalProjects={50} 
        paginate={vi.fn()} 
        currentPage={1} 
      />
    )
    
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(5) // 50/10 = 5 pages
  })

  it('highlights the current page button', () => {
    render(
      <Pagination 
        projectsPerPage={10} 
        totalProjects={50} 
        paginate={vi.fn()} 
        currentPage={3} 
      />
    )
    
    const buttons = screen.getAllByRole('button')
    
    // Since we can't directly test the variant prop with toHaveAttribute,
    // we'll check that the current page button has a different class than the others
    // This is a more implementation-agnostic way to test the highlighting behavior
    const currentPageButton = buttons[2]
    const otherButtons = [buttons[0], buttons[1], buttons[3], buttons[4]]
    
    // The current page button should have a different styling
    const currentPageButtonClasses = currentPageButton.className
    
    // All other buttons should have the same styling, different from the current page
    otherButtons.forEach(button => {
      expect(button.className).not.toBe(currentPageButtonClasses)
    })
  })

  it('calls paginate function with correct page number when clicked', () => {
    const paginateMock = vi.fn()
    render(
      <Pagination 
        projectsPerPage={10} 
        totalProjects={50} 
        paginate={paginateMock} 
        currentPage={1} 
      />
    )
    
    const secondPageButton = screen.getAllByRole('button')[1]
    fireEvent.click(secondPageButton)
    
    expect(paginateMock).toHaveBeenCalledWith(2)
  })

  it('handles case with no pages', () => {
    render(
      <Pagination 
        projectsPerPage={10} 
        totalProjects={0} 
        paginate={vi.fn()} 
        currentPage={1} 
      />
    )
    
    const buttons = screen.queryAllByRole('button')
    expect(buttons).toHaveLength(0)
  })
})

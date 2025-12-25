/**
 * VirtualizedList Component
 * 
 * A virtualized list component for rendering large lists efficiently.
 * Only renders visible items to improve performance with large datasets.
 * 
 * Features:
 * - Virtual scrolling for performance
 * - Dynamic item heights
 * - Smooth scrolling
 * - Keyboard navigation support
 * 
 * Requirements: 5.2
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Box, Typography } from '@mui/material';

interface VirtualizedListProps<T> {
  /** Array of items to render */
  items: T[];
  /** Function to render each item */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Height of the container */
  height: number;
  /** Estimated height of each item */
  itemHeight: number;
  /** Number of items to render outside visible area (for smooth scrolling) */
  overscan?: number;
  /** Callback when scroll position changes */
  onScroll?: (scrollTop: number) => void;
}

/**
 * VirtualizedList component for efficient rendering of large lists
 */
const VirtualizedList = <T,>({
  items,
  renderItem,
  height,
  itemHeight,
  overscan = 5,
  onScroll,
}: VirtualizedListProps<T>) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const containerHeight = height;
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight),
      items.length - 1
    );

    // Add overscan
    const overscanStartIndex = Math.max(0, startIndex - overscan);
    const overscanEndIndex = Math.min(items.length - 1, endIndex + overscan);

    return {
      startIndex: overscanStartIndex,
      endIndex: overscanEndIndex,
      visibleStartIndex: startIndex,
      visibleEndIndex: endIndex,
    };
  }, [scrollTop, height, itemHeight, items.length, overscan]);

  // Calculate total height
  const totalHeight = items.length * itemHeight;

  // Handle scroll events
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = event.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(newScrollTop);
  }, [onScroll]);

  // Get visible items
  const visibleItems = useMemo(() => {
    const result: Array<{ item: T; index: number; offsetTop: number }> = [];
    
    for (let i = visibleRange.startIndex; i <= visibleRange.endIndex; i++) {
      if (i >= 0 && i < items.length) {
        result.push({
          item: items[i],
          index: i,
          offsetTop: i * itemHeight,
        });
      }
    }
    
    return result;
  }, [items, visibleRange, itemHeight]);

  // Keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!containerRef.current) return;

    const { key } = event;
    const currentScrollTop = scrollTop;
    const containerHeight = height;

    switch (key) {
      case 'ArrowUp':
        event.preventDefault();
        if (currentScrollTop > 0) {
          const newScrollTop = Math.max(0, currentScrollTop - itemHeight);
          containerRef.current.scrollTop = newScrollTop;
        }
        break;

      case 'ArrowDown':
        event.preventDefault();
        if (currentScrollTop < totalHeight - containerHeight) {
          const newScrollTop = Math.min(
            totalHeight - containerHeight,
            currentScrollTop + itemHeight
          );
          containerRef.current.scrollTop = newScrollTop;
        }
        break;

      case 'PageUp':
        event.preventDefault();
        if (currentScrollTop > 0) {
          const newScrollTop = Math.max(0, currentScrollTop - containerHeight);
          containerRef.current.scrollTop = newScrollTop;
        }
        break;

      case 'PageDown':
        event.preventDefault();
        if (currentScrollTop < totalHeight - containerHeight) {
          const newScrollTop = Math.min(
            totalHeight - containerHeight,
            currentScrollTop + containerHeight
          );
          containerRef.current.scrollTop = newScrollTop;
        }
        break;

      case 'Home':
        event.preventDefault();
        containerRef.current.scrollTop = 0;
        break;

      case 'End':
        event.preventDefault();
        containerRef.current.scrollTop = totalHeight - containerHeight;
        break;
    }
  }, [scrollTop, height, itemHeight, totalHeight]);

  // Scroll to item
  const scrollToItem = useCallback((index: number, align: 'start' | 'center' | 'end' = 'start') => {
    if (!containerRef.current || index < 0 || index >= items.length) {
      return;
    }

    const itemTop = index * itemHeight;
    const containerHeight = height;
    
    let scrollTop: number;
    
    switch (align) {
      case 'start':
        scrollTop = itemTop;
        break;
      case 'center':
        scrollTop = itemTop - (containerHeight - itemHeight) / 2;
        break;
      case 'end':
        scrollTop = itemTop - containerHeight + itemHeight;
        break;
    }

    // Clamp scroll position
    scrollTop = Math.max(0, Math.min(totalHeight - containerHeight, scrollTop));
    
    containerRef.current.scrollTop = scrollTop;
  }, [items.length, itemHeight, height, totalHeight]);

  // Performance monitoring
  const renderStats = useMemo(() => {
    const visibleCount = visibleRange.endIndex - visibleRange.startIndex + 1;
    const renderRatio = (visibleCount / items.length) * 100;
    
    return {
      totalItems: items.length,
      visibleItems: visibleCount,
      renderRatio: Math.round(renderRatio * 100) / 100,
      scrollPosition: Math.round((scrollTop / (totalHeight - height)) * 100) || 0,
    };
  }, [visibleRange, items.length, scrollTop, totalHeight, height]);

  // Debug info (only in development)
  const showDebugInfo = process.env.NODE_ENV === 'development' && items.length > 100;

  return (
    <Box
      sx={{
        position: 'relative',
        height,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
      }}
    >
      {/* Debug info */}
      {showDebugInfo && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            zIndex: 1000,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            p: 0.5,
            fontSize: '0.7rem',
            opacity: 0.8,
          }}
        >
          <Typography variant="caption" component="div">
            Items: {renderStats.totalItems} | Visible: {renderStats.visibleItems} | 
            Render: {renderStats.renderRatio}% | Scroll: {renderStats.scrollPosition}%
          </Typography>
        </Box>
      )}

      {/* Scrollable container */}
      <Box
        ref={containerRef}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        sx={{
          height: '100%',
          overflow: 'auto',
          outline: 'none',
          '&:focus': {
            outline: '2px solid',
            outlineColor: 'primary.main',
            outlineOffset: -2,
          },
        }}
        role="listbox"
        aria-label={`Virtualized list with ${items.length} items`}
        aria-rowcount={items.length}
      >
        {/* Total height spacer */}
        <Box
          ref={scrollElementRef}
          sx={{
            height: totalHeight,
            position: 'relative',
          }}
        >
          {/* Visible items */}
          {visibleItems.map(({ item, index, offsetTop }) => (
            <Box
              key={index}
              sx={{
                position: 'absolute',
                top: offsetTop,
                left: 0,
                right: 0,
                height: itemHeight,
                display: 'flex',
                alignItems: 'center',
              }}
              role="option"
              aria-rowindex={index + 1}
              aria-selected={false}
            >
              {renderItem(item, index)}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Performance indicator for large lists */}
      {items.length > 1000 && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            bgcolor: 'success.main',
            color: 'success.contrastText',
            px: 1,
            py: 0.5,
            borderRadius: 1,
            fontSize: '0.7rem',
            opacity: 0.8,
          }}
        >
          <Typography variant="caption">
            Virtualized ({items.length} items)
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default VirtualizedList;
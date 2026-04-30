import { useState, useCallback } from "react";

/**
 * Custom hook for managing table pagination and search state
 * @param {number} initialLimit - Initial items per page (default: 10)
 * @returns {object} - Pagination state and handlers
 */
export function usePagination(initialLimit = 10) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search to avoid excessive API calls
  const handleSearchChange = useCallback((value) => {
    setSearch(value);
    setPage(1); // Reset to page 1 on search

    // Debounce the actual search value
    const timer = setTimeout(() => {
      setDebouncedSearch(value);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const handleLimitChange = useCallback((newLimit) => {
    setLimit(newLimit);
    setPage(1); // Reset to page 1 when changing limit
  }, []);

  const resetPagination = useCallback(() => {
    setPage(1);
    setSearch("");
    setDebouncedSearch("");
  }, []);

  return {
    page,
    limit,
    search,
    debouncedSearch,
    setPage: handlePageChange,
    setLimit: handleLimitChange,
    setSearch: handleSearchChange,
    resetPagination,
  };
}
